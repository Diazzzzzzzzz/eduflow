-- EduFlow — Stage 3a: the homework lifecycle (assign → submit → grade).
--
-- The tables have existed since 0004 but were never reachable: `homework` had
-- RLS enabled with NO policy (invisible to every session, exactly like `groups`
-- before 0012), and homework_submissions was scoped to staff only, so a student
-- could not see — let alone hand in — their own work. The interactive screens
-- have been running on in-memory React state that is lost on reload.

-- ---------------------------------------------------------------------------
-- 1. Columns the workflow needs.
-- ---------------------------------------------------------------------------
alter table public.homework
  add column if not exists group_id  uuid references public.groups (id) on delete cascade,
  add column if not exists min_words int,
  add column if not exists created_by uuid references auth.users (id) on delete set null;

create index if not exists homework_group_id_idx on public.homework (group_id);

alter table public.homework_submissions
  -- Per-criterion IELTS writing marks, shown on the review screen.
  add column if not exists criteria  jsonb,
  add column if not exists graded_by uuid references auth.users (id) on delete set null,
  add column if not exists graded_at timestamptz;

-- ---------------------------------------------------------------------------
-- 2. Keep homework.group_id and the legacy group_name in step, both ways —
--    same reasoning as students in 0012: seeds and older code write only the
--    text column, and the UI still reads it.
-- ---------------------------------------------------------------------------
create or replace function public.sync_homework_group()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.group_id is not null then
    select name into new.group_name from public.groups where id = new.group_id;
  elsif new.group_name is not null and new.group_name <> '' then
    select id into new.group_id from public.groups where name = new.group_name;
  end if;
  return new;
end;
$$;

drop trigger if exists homework_sync_group on public.homework;
create trigger homework_sync_group
  before insert or update of group_id, group_name on public.homework
  for each row execute function public.sync_homework_group();

update public.homework h
   set group_id = g.id
  from public.groups g
 where g.name = h.group_name
   and h.group_id is distinct from g.id;

-- ---------------------------------------------------------------------------
-- 3. A student may hand work in, but must never mark their own paper.
--    RLS decides WHICH rows are writable; this trigger decides WHICH COLUMNS,
--    which RLS cannot express. Defence in depth: the API already restricts the
--    fields it writes, but the browser holds the anon key and could call
--    PostgREST directly.
-- ---------------------------------------------------------------------------
create or replace function public.guard_submission_grading()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.current_user_role() = 'student' then
    if new.band_score is distinct from old.band_score
       or new.feedback is distinct from old.feedback
       or new.criteria is distinct from old.criteria
       or new.graded_by is distinct from old.graded_by then
      raise exception 'Студент не может выставлять оценку или отзыв';
    end if;
    -- A student may only move their work forward to "submitted".
    if new.status not in ('assigned', 'submitted') then
      raise exception 'Недопустимый статус для студента: %', new.status;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists submissions_guard_grading on public.homework_submissions;
create trigger submissions_guard_grading
  before update on public.homework_submissions
  for each row execute function public.guard_submission_grading();

-- ---------------------------------------------------------------------------
-- 4. RLS.
-- ---------------------------------------------------------------------------

-- homework: staff manage their centre's; students and parents read what is
-- assigned to the group they belong to.
drop policy if exists "homework_rw_center" on public.homework;
create policy "homework_rw_center" on public.homework
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

drop policy if exists "homework_select_member" on public.homework;
create policy "homework_select_member" on public.homework
  for select using (
    group_id in (
      select group_id from public.students
       where id = public.current_user_student_id()
          or id in (select public.current_user_ward_ids())
    )
  );

-- homework_submissions: the centre policy from 0004 stays for staff. Add the
-- student's own row (read + hand in) and the parent's read-only view.
drop policy if exists "hw_submissions_select_self" on public.homework_submissions;
create policy "hw_submissions_select_self" on public.homework_submissions
  for select using (
    student_id = public.current_user_student_id()
    or student_id in (select public.current_user_ward_ids())
  );

drop policy if exists "hw_submissions_update_self" on public.homework_submissions;
create policy "hw_submissions_update_self" on public.homework_submissions
  for update
  using (student_id = public.current_user_student_id())
  with check (student_id = public.current_user_student_id());

-- Insert is staff-only (assigning work). A student never creates a row; the
-- assignment already exists for them to fill in.
