-- IELTS Pulse — initial schema
-- Tables: language_centers, teachers, students, mock_tests, recommendations,
-- parent_reports. Row Level Security is enabled on every table with policies
-- scoped to the centres a teacher belongs to.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table if not exists public.language_centers (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  slug       text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.teachers (
  id         uuid primary key default gen_random_uuid(),
  center_id  uuid not null references public.language_centers (id) on delete cascade,
  user_id    uuid references auth.users (id) on delete set null,
  name       text not null,
  role       text not null default 'teacher' check (role in ('teacher', 'director')),
  created_at timestamptz not null default now()
);

create table if not exists public.students (
  id            uuid primary key default gen_random_uuid(),
  center_id     uuid not null references public.language_centers (id) on delete cascade,
  teacher_id    uuid references public.teachers (id) on delete set null,
  name          text not null,
  initials      text not null,
  student_group text not null,
  target_band   numeric(2, 1) not null check (target_band between 0 and 9),
  exam_date     date,
  attendance    int not null default 0 check (attendance between 0 and 100),
  teacher_note  text,
  created_at    timestamptz not null default now()
);

create table if not exists public.mock_tests (
  id         uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students (id) on delete cascade,
  label      text not null,
  taken_on   date not null,
  listening  numeric(2, 1) not null check (listening between 0 and 9),
  reading    numeric(2, 1) not null check (reading between 0 and 9),
  writing    numeric(2, 1) not null check (writing between 0 and 9),
  speaking   numeric(2, 1) not null check (speaking between 0 and 9),
  -- Official IELTS overall: mean of four skills rounded to nearest 0.5
  -- (.25/.75 round up). Postgres round() rounds half away from zero.
  overall    numeric(2, 1) generated always as (
               round(((listening + reading + writing + speaking) / 4.0) * 2) / 2
             ) stored,
  created_at timestamptz not null default now()
);

create table if not exists public.recommendations (
  id         uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students (id) on delete cascade,
  skill      text not null check (skill in ('listening', 'reading', 'writing', 'speaking')),
  priority   text not null check (priority in ('high', 'medium', 'low')),
  title      text not null,
  detail     text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.parent_reports (
  id         uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students (id) on delete cascade,
  week_of    date not null,
  channel    text check (channel in ('whatsapp', 'telegram', 'email')),
  status     text not null default 'pending' check (status in ('pending', 'sent')),
  summary    text,
  sent_at    timestamptz,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------

create index if not exists teachers_center_id_idx        on public.teachers (center_id);
create index if not exists teachers_user_id_idx          on public.teachers (user_id);
create index if not exists students_center_id_idx        on public.students (center_id);
create index if not exists mock_tests_student_id_idx     on public.mock_tests (student_id);
create index if not exists mock_tests_taken_on_idx       on public.mock_tests (taken_on);
create index if not exists recommendations_student_idx   on public.recommendations (student_id);
create index if not exists parent_reports_student_idx    on public.parent_reports (student_id);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

-- Centres the currently authenticated user teaches at. SECURITY DEFINER so the
-- lookup itself isn't blocked by RLS on teachers.
create or replace function public.current_user_center_ids()
returns setof uuid
language sql
stable
security definer
set search_path = public
as $$
  select center_id from public.teachers where user_id = auth.uid();
$$;

alter table public.language_centers enable row level security;
alter table public.teachers         enable row level security;
alter table public.students         enable row level security;
alter table public.mock_tests       enable row level security;
alter table public.recommendations  enable row level security;
alter table public.parent_reports   enable row level security;

-- Centres: a member can read their own centre.
create policy "centers_select_own" on public.language_centers
  for select using (id in (select public.current_user_center_ids()));

-- Teachers: readable within the same centre.
create policy "teachers_select_center" on public.teachers
  for select using (center_id in (select public.current_user_center_ids()));

-- Students: full access within the teacher's centre(s).
create policy "students_rw_center" on public.students
  for all
  using (center_id in (select public.current_user_center_ids()))
  with check (center_id in (select public.current_user_center_ids()));

-- Child tables inherit access via the parent student's centre.
create policy "mock_tests_rw_center" on public.mock_tests
  for all
  using (student_id in (
    select id from public.students where center_id in (select public.current_user_center_ids())
  ))
  with check (student_id in (
    select id from public.students where center_id in (select public.current_user_center_ids())
  ));

create policy "recommendations_rw_center" on public.recommendations
  for all
  using (student_id in (
    select id from public.students where center_id in (select public.current_user_center_ids())
  ))
  with check (student_id in (
    select id from public.students where center_id in (select public.current_user_center_ids())
  ));

create policy "parent_reports_rw_center" on public.parent_reports
  for all
  using (student_id in (
    select id from public.students where center_id in (select public.current_user_center_ids())
  ))
  with check (student_id in (
    select id from public.students where center_id in (select public.current_user_center_ids())
  ));

-- NOTE: with RLS on and no end-user auth yet, the anon/authenticated roles see
-- nothing. The app reads server-side via the service-role key (see
-- lib/supabase/server.ts), which bypasses RLS. When you add teacher login,
-- link auth.users -> teachers.user_id and these policies start enforcing
-- per-centre isolation automatically.
