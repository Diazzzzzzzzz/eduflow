-- EduFlow — Stage 1: roles, parent↔child links, and RLS for end-user auth.
--
-- Idempotent. This is the migration that lets the app read through the user's
-- own session (RLS enforced) instead of the service-role key. Until now every
-- policy was scoped through public.teachers, so a student or parent user would
-- see nothing; the helpers and policies below give those roles a real, minimal
-- window onto their own data.

-- ---------------------------------------------------------------------------
-- 1. Role constraint — assert the full five-role set.
--    0008 already widened this, but 0003 created the table with only three
--    roles. Re-asserting here removes any dependence on application order.
-- ---------------------------------------------------------------------------
alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles
  add constraint profiles_role_check
  check (role in ('owner', 'admin', 'teacher', 'student', 'parent'));

-- ---------------------------------------------------------------------------
-- 2. Parent ↔ child as a real many-to-many entity.
--    profiles.student_id stays usable for a STUDENT (their own row) but must no
--    longer be treated as the parent link — a parent may have several children.
-- ---------------------------------------------------------------------------
create table if not exists public.guardianships (
  id             uuid primary key default gen_random_uuid(),
  parent_user_id uuid not null references auth.users (id) on delete cascade,
  student_id     uuid not null references public.students (id) on delete cascade,
  created_at     timestamptz not null default now(),
  unique (parent_user_id, student_id)
);

create index if not exists guardianships_parent_idx
  on public.guardianships (parent_user_id);
create index if not exists guardianships_student_idx
  on public.guardianships (student_id);

-- ---------------------------------------------------------------------------
-- 3. Session helpers. SECURITY DEFINER so the lookup is not itself blocked by
--    RLS on profiles. STABLE: same result within a statement.
-- ---------------------------------------------------------------------------

-- The caller's role, or null when signed out.
create or replace function public.current_user_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

-- The student row a STUDENT account is pinned to (null for every other role).
create or replace function public.current_user_student_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select student_id
  from public.profiles
  where id = auth.uid() and role = 'student';
$$;

-- Student ids the caller is a guardian of. Empty for non-parents.
create or replace function public.current_user_ward_ids()
returns setof uuid
language sql
stable
security definer
set search_path = public
as $$
  select student_id from public.guardianships where parent_user_id = auth.uid();
$$;

-- ---------------------------------------------------------------------------
-- 4. guardianships RLS: a parent sees only their own links; staff of the
--    child's centre may read them (needed to manage families in Stage 2).
-- ---------------------------------------------------------------------------
alter table public.guardianships enable row level security;

drop policy if exists "guardianships_parent_select" on public.guardianships;
create policy "guardianships_parent_select" on public.guardianships
  for select using (parent_user_id = auth.uid());

drop policy if exists "guardianships_staff_select" on public.guardianships;
create policy "guardianships_staff_select" on public.guardianships
  for select using (
    student_id in (
      select id from public.students
      where center_id in (select public.current_user_center_ids())
    )
  );

-- ---------------------------------------------------------------------------
-- 5. Extra read windows on student data for the student and parent roles.
--    The existing "*_rw_center" policies (staff, via teachers) are kept as-is;
--    RLS ORs policies together, so these only ADD visibility, never widen the
--    staff scope. Students and parents get SELECT only — they never write a
--    student, mock test or recommendation row.
-- ---------------------------------------------------------------------------

-- students -----------------------------------------------------------------
drop policy if exists "students_self_select" on public.students;
create policy "students_self_select" on public.students
  for select using (id = public.current_user_student_id());

drop policy if exists "students_parent_select" on public.students;
create policy "students_parent_select" on public.students
  for select using (id in (select public.current_user_ward_ids()));

-- mock_tests ---------------------------------------------------------------
drop policy if exists "mock_tests_self_select" on public.mock_tests;
create policy "mock_tests_self_select" on public.mock_tests
  for select using (
    student_id = public.current_user_student_id()
    or student_id in (select public.current_user_ward_ids())
  );

-- recommendations ----------------------------------------------------------
drop policy if exists "recommendations_self_select" on public.recommendations;
create policy "recommendations_self_select" on public.recommendations
  for select using (
    student_id = public.current_user_student_id()
    or student_id in (select public.current_user_ward_ids())
  );

-- parent_reports -----------------------------------------------------------
drop policy if exists "parent_reports_self_select" on public.parent_reports;
create policy "parent_reports_self_select" on public.parent_reports
  for select using (
    student_id = public.current_user_student_id()
    or student_id in (select public.current_user_ward_ids())
  );
