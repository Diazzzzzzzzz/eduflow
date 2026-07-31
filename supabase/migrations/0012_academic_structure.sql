-- EduFlow — Stage 2: academic structure.
--
-- Turns the string-based coupling (students.student_group = 'IELTS 62') into
-- real relations, WITHOUT dropping the strings: homework.group_name,
-- attendance.group_name and most of the UI still read them, and rewriting those
-- is Stage 3. The text column stays as the compatibility surface and is kept in
-- sync by a trigger, so both paths agree.
--
-- Also fills a gap found in Stage 1: `groups` had RLS enabled but not a single
-- policy, so it was invisible to every non-service-role reader.

-- ---------------------------------------------------------------------------
-- 1. Groups belong to a centre (they were global until now).
-- ---------------------------------------------------------------------------
alter table public.groups
  add column if not exists center_id uuid references public.language_centers (id) on delete cascade;

-- Single-tenant today: attach any orphan group to the one existing centre.
update public.groups g
   set center_id = (select id from public.language_centers order by created_at limit 1)
 where g.center_id is null;

create index if not exists groups_center_idx on public.groups (center_id);

-- ---------------------------------------------------------------------------
-- 2. Courses — the syllabus a group follows. `lessons` already holds the
--    24-lesson programme per centre; a course names it and lets a centre run
--    more than one programme later.
-- ---------------------------------------------------------------------------
create table if not exists public.courses (
  id           uuid primary key default gen_random_uuid(),
  center_id    uuid not null references public.language_centers (id) on delete cascade,
  name         text not null,
  description  text,
  total_lessons int not null default 24 check (total_lessons >= 1),
  created_at   timestamptz not null default now(),
  unique (center_id, name)
);

create index if not exists courses_center_idx on public.courses (center_id);

alter table public.groups
  add column if not exists course_id uuid references public.courses (id) on delete set null;

-- Seed one default course per centre and point existing groups at it.
insert into public.courses (center_id, name, description, total_lessons)
select c.id, 'IELTS General Preparation', 'Программа подготовки к IELTS по умолчанию', 24
  from public.language_centers c
 where not exists (
   select 1 from public.courses x
    where x.center_id = c.id and x.name = 'IELTS General Preparation'
 );

update public.groups g
   set course_id = (select id from public.courses c where c.center_id = g.center_id limit 1)
 where g.course_id is null and g.center_id is not null;

-- ---------------------------------------------------------------------------
-- 3. Enrollment — student ↔ group as a real, dated relation.
-- ---------------------------------------------------------------------------
create table if not exists public.enrollments (
  id          uuid primary key default gen_random_uuid(),
  group_id    uuid not null references public.groups (id) on delete cascade,
  student_id  uuid not null references public.students (id) on delete cascade,
  status      text not null default 'active' check (status in ('active', 'completed', 'withdrawn')),
  enrolled_on date not null default current_date,
  created_at  timestamptz not null default now(),
  unique (group_id, student_id)
);

create index if not exists enrollments_group_idx   on public.enrollments (group_id);
create index if not exists enrollments_student_idx on public.enrollments (student_id);

-- A direct pointer for the common "which group is this student in" read. The
-- text column student_group remains the legacy mirror.
alter table public.students
  add column if not exists group_id uuid references public.groups (id) on delete set null;

create index if not exists students_group_idx on public.students (group_id);

-- Backfill from the existing strings, creating any group that only ever
-- existed as text on a student row.
insert into public.groups (name, center_id)
select distinct s.student_group,
       (select id from public.language_centers order by created_at limit 1)
  from public.students s
 where s.student_group is not null
   and s.student_group <> ''
   and not exists (select 1 from public.groups g where g.name = s.student_group)
on conflict (name) do nothing;

update public.students s
   set group_id = g.id
  from public.groups g
 where g.name = s.student_group
   and s.group_id is distinct from g.id;

insert into public.enrollments (group_id, student_id)
select s.group_id, s.id
  from public.students s
 where s.group_id is not null
on conflict (group_id, student_id) do nothing;

-- ---------------------------------------------------------------------------
-- 4. Keep the FK and the legacy text column in step, in BOTH directions.
--
--    This has to be a trigger rather than a one-off backfill: setup.sql applies
--    the migrations and then re-runs the seeds, which delete-and-reinsert the
--    student rows with only student_group set. A one-shot UPDATE is wiped by
--    that; a trigger makes the link self-healing for any future insert too.
-- ---------------------------------------------------------------------------
create or replace function public.sync_student_group()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.group_id is not null then
    -- FK wins: mirror its name into the legacy text column.
    select name into new.student_group from public.groups where id = new.group_id;
  elsif new.student_group is not null and new.student_group <> '' then
    -- Only the legacy string was supplied (seeds, older code): resolve the FK.
    select id into new.group_id from public.groups where name = new.student_group;
  end if;
  return new;
end;
$$;

drop trigger if exists students_sync_group_name on public.students;
drop trigger if exists students_sync_group on public.students;
create trigger students_sync_group
  before insert or update of group_id, student_group on public.students
  for each row execute function public.sync_student_group();

-- Enrollment follows the student's group automatically, for the same reason.
create or replace function public.sync_student_enrollment()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.group_id is not null then
    insert into public.enrollments (group_id, student_id)
    values (new.group_id, new.id)
    on conflict (group_id, student_id) do nothing;
  end if;
  return new;
end;
$$;

drop trigger if exists students_sync_enrollment on public.students;
create trigger students_sync_enrollment
  after insert or update of group_id on public.students
  for each row execute function public.sync_student_enrollment();

-- Re-run the backfill for rows that already exist (the triggers only fire on
-- write). Harmless when everything is already linked.
update public.students s
   set group_id = g.id
  from public.groups g
 where g.name = s.student_group
   and s.group_id is distinct from g.id;

-- ---------------------------------------------------------------------------
-- 5. RLS. `groups` had it enabled with NO policy, which is why a teacher's
--    session could not read it at all (worked around in Stage 1).
-- ---------------------------------------------------------------------------
alter table public.courses     enable row level security;
alter table public.enrollments enable row level security;

-- Groups: staff read their centre; a student reads their own group; a parent
-- reads their wards' groups.
drop policy if exists "groups_select_center" on public.groups;
create policy "groups_select_center" on public.groups
  for select using (center_id in (select public.current_user_center_ids()));

drop policy if exists "groups_write_center" on public.groups;
create policy "groups_write_center" on public.groups
  for all
  using (center_id in (select public.current_user_center_ids()))
  with check (center_id in (select public.current_user_center_ids()));

drop policy if exists "groups_select_member" on public.groups;
create policy "groups_select_member" on public.groups
  for select using (
    id in (
      select group_id from public.students
       where id = public.current_user_student_id()
          or id in (select public.current_user_ward_ids())
    )
  );

-- Courses: readable by anyone in the centre; writable by staff of that centre.
drop policy if exists "courses_rw_center" on public.courses;
create policy "courses_rw_center" on public.courses
  for all
  using (center_id in (select public.current_user_center_ids()))
  with check (center_id in (select public.current_user_center_ids()));

drop policy if exists "courses_select_member" on public.courses;
create policy "courses_select_member" on public.courses
  for select using (
    id in (
      select g.course_id from public.groups g
       join public.students s on s.group_id = g.id
      where s.id = public.current_user_student_id()
         or s.id in (select public.current_user_ward_ids())
    )
  );

-- Enrollments: staff manage those in their centre; a student/parent may read
-- their own rows.
drop policy if exists "enrollments_rw_center" on public.enrollments;
create policy "enrollments_rw_center" on public.enrollments
  for all
  using (
    student_id in (
      select id from public.students
       where center_id in (select public.current_user_center_ids())
    )
  )
  with check (
    student_id in (
      select id from public.students
       where center_id in (select public.current_user_center_ids())
    )
  );

drop policy if exists "enrollments_select_self" on public.enrollments;
create policy "enrollments_select_self" on public.enrollments
  for select using (
    student_id = public.current_user_student_id()
    or student_id in (select public.current_user_ward_ids())
  );

-- Guardianships: 0011 gave this table SELECT policies only, so nobody but the
-- service role could revoke a link. Staff of the child's centre may now manage
-- them (creating one still needs auth.users, hence the admin path in the API).
drop policy if exists "guardianships_staff_write" on public.guardianships;
create policy "guardianships_staff_write" on public.guardianships
  for all
  using (
    student_id in (
      select id from public.students
       where center_id in (select public.current_user_center_ids())
    )
  )
  with check (
    student_id in (
      select id from public.students
       where center_id in (select public.current_user_center_ids())
    )
  );
