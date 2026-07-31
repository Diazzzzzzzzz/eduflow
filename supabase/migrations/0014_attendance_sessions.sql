-- EduFlow — Stage 3b: class sessions and persistent attendance.
--
-- `attendance` has existed since 0004 but only staff could see it (no student/
-- parent read policy), it hung from a bare date + group_name string rather
-- than a class occurrence, and the UI never wrote it anywhere. Also, the
-- roster's headline `students.attendance` percentage was a seeded number with
-- no relation to the marks; it now recomputes from the real rows.

-- ---------------------------------------------------------------------------
-- 1. class_sessions — one row per group per teaching day. Created lazily when
--    attendance is first marked for that day, so no scheduling UI is required
--    yet; a future timetable feature can pre-create rows with topics.
-- ---------------------------------------------------------------------------
create table if not exists public.class_sessions (
  id         uuid primary key default gen_random_uuid(),
  group_id   uuid not null references public.groups (id) on delete cascade,
  date       date not null,
  topic      text,
  lesson_number int,
  created_at timestamptz not null default now(),
  unique (group_id, date)
);

create index if not exists class_sessions_group_idx on public.class_sessions (group_id, date);

-- ---------------------------------------------------------------------------
-- 2. attendance gains real links: the group (FK) and the session.
-- ---------------------------------------------------------------------------
alter table public.attendance
  add column if not exists group_id   uuid references public.groups (id) on delete set null,
  add column if not exists session_id uuid references public.class_sessions (id) on delete set null,
  add column if not exists marked_by  uuid references auth.users (id) on delete set null;

create index if not exists attendance_group_idx   on public.attendance (group_id, date);
create index if not exists attendance_session_idx on public.attendance (session_id);

-- Resolve group_id from the legacy string (and vice versa), then attach the
-- session row, creating it for that group+date if it does not exist yet.
create or replace function public.sync_attendance_links()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.group_id is null and new.group_name is not null and new.group_name <> '' then
    select id into new.group_id from public.groups where name = new.group_name;
  elsif new.group_id is not null and (new.group_name is null or new.group_name = '') then
    select name into new.group_name from public.groups where id = new.group_id;
  end if;

  if new.group_id is not null and new.session_id is null then
    insert into public.class_sessions (group_id, date)
    values (new.group_id, new.date)
    on conflict (group_id, date) do nothing;
    select id into new.session_id
      from public.class_sessions
     where group_id = new.group_id and date = new.date;
  end if;
  return new;
end;
$$;

drop trigger if exists attendance_sync_links on public.attendance;
create trigger attendance_sync_links
  before insert or update of group_id, group_name, date on public.attendance
  for each row execute function public.sync_attendance_links();

-- Backfill existing rows (the trigger only fires on writes).
update public.attendance a
   set group_id = g.id
  from public.groups g
 where g.name = a.group_name
   and a.group_id is distinct from g.id;

-- ---------------------------------------------------------------------------
-- 3. The roster's headline percentage becomes an honest number: recompute
--    students.attendance from the marks whenever one changes. Present and late
--    both count as attended (late is not absence), matching the tracker's
--    "на занятии" counter.
-- ---------------------------------------------------------------------------
create or replace function public.recompute_student_attendance()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  sid uuid := coalesce(new.student_id, old.student_id);
  pct int;
begin
  select coalesce(round(100.0 * count(*) filter (where status in ('present','late'))
                  / nullif(count(*), 0)), 0)::int
    into pct
    from public.attendance
   where student_id = sid;

  -- No marks at all → leave the seeded percentage alone rather than zeroing
  -- every dashboard the moment the feature ships.
  if pct is not null and exists (select 1 from public.attendance where student_id = sid) then
    update public.students set attendance = pct where id = sid;
  end if;
  return coalesce(new, old);
end;
$$;

drop trigger if exists attendance_recompute_pct on public.attendance;
create trigger attendance_recompute_pct
  after insert or update of status or delete on public.attendance
  for each row execute function public.recompute_student_attendance();

-- ---------------------------------------------------------------------------
-- 4. RLS. Staff keep the centre policy from 0004; a student and their parent
--    may now READ the student's own marks. Writing stays staff-only.
-- ---------------------------------------------------------------------------
drop policy if exists "attendance_select_self" on public.attendance;
create policy "attendance_select_self" on public.attendance
  for select using (
    student_id = public.current_user_student_id()
    or student_id in (select public.current_user_ward_ids())
  );

alter table public.class_sessions enable row level security;

drop policy if exists "class_sessions_rw_center" on public.class_sessions;
create policy "class_sessions_rw_center" on public.class_sessions
  for all
  using (
    group_id in (
      select id from public.groups
       where center_id in (select public.current_user_center_ids())
    )
  )
  with check (
    group_id in (
      select id from public.groups
       where center_id in (select public.current_user_center_ids())
    )
  );

drop policy if exists "class_sessions_select_member" on public.class_sessions;
create policy "class_sessions_select_member" on public.class_sessions
  for select using (
    group_id in (
      select group_id from public.students
       where id = public.current_user_student_id()
          or id in (select public.current_user_ward_ids())
    )
  );
