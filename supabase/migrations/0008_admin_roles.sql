-- EduFlow — administrator/owner roles and group ownership.
--
-- The director dashboard needs two things the schema didn't have: a role above
-- "teacher", and a way to say which teacher runs which group.

-- Widen the role check. Drop-then-add because Postgres has no
-- `alter constraint ... check`.
alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles
  add constraint profiles_role_check
  check (role in ('owner', 'admin', 'teacher', 'student', 'parent'));

-- `teachers.role` gains the same top tier so the roster can show who is staff
-- leadership rather than a class teacher.
alter table public.teachers drop constraint if exists teachers_role_check;
alter table public.teachers
  add constraint teachers_role_check
  check (role in ('owner', 'admin', 'director', 'teacher'));

alter table public.groups
  add column if not exists teacher_id uuid references public.teachers (id) on delete set null;

create index if not exists groups_teacher_idx on public.groups (teacher_id);

-- Homework rows are seeded with fixed ids so re-seeding replaces rather than
-- duplicates them; this index keeps the director's pending-review query cheap.
create index if not exists hw_submissions_status_idx
  on public.homework_submissions (status, submitted_at);
