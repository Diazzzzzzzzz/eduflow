-- IELTS Pulse — one-shot setup: schema + RLS + seed.
-- Paste this whole file into the Supabase SQL Editor and Run.
-- Safe to re-run (idempotent).

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


-- IELTS Pulse — seed data (generated by scripts/gen-seed.ts).
-- Safe to re-run: centre/teacher/students upsert by fixed id;
-- child rows are deleted for these students then re-inserted.

insert into public.language_centers (id, name, slug) values
  ('11111111-1111-1111-1111-111111111111', 'Astana English Academy', 'astana-english-academy')
  on conflict (id) do nothing;

insert into public.teachers (id, center_id, name, role) values
  ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'Dana Iskakova', 'director')
  on conflict (id) do nothing;

delete from public.students where id in ('33333333-3333-3333-3333-000000000001', '33333333-3333-3333-3333-000000000002', '33333333-3333-3333-3333-000000000003', '33333333-3333-3333-3333-000000000004', '33333333-3333-3333-3333-000000000005', '33333333-3333-3333-3333-000000000006', '33333333-3333-3333-3333-000000000007', '33333333-3333-3333-3333-000000000008', '33333333-3333-3333-3333-000000000009', '33333333-3333-3333-3333-000000000010', '33333333-3333-3333-3333-000000000011', '33333333-3333-3333-3333-000000000012');

-- Arman Kalibekov
insert into public.students (id, center_id, teacher_id, name, initials, student_group, target_band, exam_date, attendance, teacher_note) values
  ('33333333-3333-3333-3333-000000000001', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'Arman Kalibekov', 'AK', 'IELTS Intensive — Morning', 7.5, '2026-09-19', 96, 'Arman is showing great progress in Listening. Needs to practice Writing Task 2 vocabulary and linking devices.');
insert into public.mock_tests (student_id, label, taken_on, listening, reading, writing, speaking) values
  ('33333333-3333-3333-3333-000000000001', 'Mock #1 — Diagnostic', '2026-02-14', 6, 5.5, 5, 5.5);
insert into public.mock_tests (student_id, label, taken_on, listening, reading, writing, speaking) values
  ('33333333-3333-3333-3333-000000000001', 'Mock #2 — Cambridge 17', '2026-03-14', 6.5, 6, 5.5, 6);
insert into public.mock_tests (student_id, label, taken_on, listening, reading, writing, speaking) values
  ('33333333-3333-3333-3333-000000000001', 'Mock #3 — Cambridge 18', '2026-04-11', 6.5, 6.5, 5.5, 6);
insert into public.mock_tests (student_id, label, taken_on, listening, reading, writing, speaking) values
  ('33333333-3333-3333-3333-000000000001', 'Mock #4 — Midterm Mock', '2026-05-09', 7, 6.5, 6, 6.5);
insert into public.mock_tests (student_id, label, taken_on, listening, reading, writing, speaking) values
  ('33333333-3333-3333-3333-000000000001', 'Mock #5 — Cambridge 19', '2026-06-13', 7.5, 6.5, 6, 6.5);
insert into public.mock_tests (student_id, label, taken_on, listening, reading, writing, speaking) values
  ('33333333-3333-3333-3333-000000000001', 'Mock #6 — Full Simulation', '2026-07-11', 7.5, 7, 6, 7);
insert into public.recommendations (student_id, skill, priority, title, detail) values
  ('33333333-3333-3333-3333-000000000001', 'writing', 'high', 'Task 2 coherence needs linking words', 'Essays lose marks on progression. Drill ''however / consequently / in contrast'' and paragraph topic sentences — 3 timed intros this week.');
insert into public.recommendations (student_id, skill, priority, title, detail) values
  ('33333333-3333-3333-3333-000000000001', 'reading', 'medium', 'True / False / Not Given accuracy', 'Currently 6/13 on TFNG sets. Practise locating the exact sentence before judging — Cambridge 18, Tests 2–4.');
insert into public.recommendations (student_id, skill, priority, title, detail) values
  ('33333333-3333-3333-3333-000000000001', 'speaking', 'low', 'Part 3 answer depth', 'Answers are fluent but short. Use the ''opinion → reason → example'' frame to stretch responses past 30 seconds.');

-- Aruzhan Mukasheva
insert into public.students (id, center_id, teacher_id, name, initials, student_group, target_band, exam_date, attendance, teacher_note) values
  ('33333333-3333-3333-3333-000000000002', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'Aruzhan Mukasheva', 'AM', 'IELTS Intensive — Morning', 8, '2026-08-22', 100, 'Aruzhan is our strongest reader. Speaking fluency is excellent; push pronunciation of consonant clusters for 8.0.');
insert into public.mock_tests (student_id, label, taken_on, listening, reading, writing, speaking) values
  ('33333333-3333-3333-3333-000000000002', 'Mock #1 — Diagnostic', '2026-02-14', 7, 7.5, 6, 6.5);
insert into public.mock_tests (student_id, label, taken_on, listening, reading, writing, speaking) values
  ('33333333-3333-3333-3333-000000000002', 'Mock #2 — Cambridge 17', '2026-03-14', 7, 7.5, 6.5, 7);
insert into public.mock_tests (student_id, label, taken_on, listening, reading, writing, speaking) values
  ('33333333-3333-3333-3333-000000000002', 'Mock #3 — Cambridge 18', '2026-04-11', 7.5, 8, 6.5, 7);
insert into public.mock_tests (student_id, label, taken_on, listening, reading, writing, speaking) values
  ('33333333-3333-3333-3333-000000000002', 'Mock #4 — Midterm Mock', '2026-05-09', 7.5, 8, 6.5, 7.5);
insert into public.mock_tests (student_id, label, taken_on, listening, reading, writing, speaking) values
  ('33333333-3333-3333-3333-000000000002', 'Mock #5 — Cambridge 19', '2026-06-13', 8, 8.5, 7, 7.5);
insert into public.mock_tests (student_id, label, taken_on, listening, reading, writing, speaking) values
  ('33333333-3333-3333-3333-000000000002', 'Mock #6 — Full Simulation', '2026-07-11', 8, 8.5, 7, 7.5);
insert into public.recommendations (student_id, skill, priority, title, detail) values
  ('33333333-3333-3333-3333-000000000002', 'writing', 'high', 'Task 1 overview statements', 'Reports jump straight into data. Open body with a two-sentence overview of main trends before any figures.');
insert into public.recommendations (student_id, skill, priority, title, detail) values
  ('33333333-3333-3333-3333-000000000002', 'speaking', 'medium', 'Consonant cluster pronunciation', '''Sixth'', ''strengths'', ''crisps'' — shadow BBC 6-Minute English daily for 10 minutes.');

-- Dias Serikbay
insert into public.students (id, center_id, teacher_id, name, initials, student_group, target_band, exam_date, attendance, teacher_note) values
  ('33333333-3333-3333-3333-000000000003', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'Dias Serikbay', 'DS', 'IELTS Intensive — Evening', 7, '2026-10-03', 88, 'Dias improved two half-bands in Listening this term. Reading speed is the main blocker — needs timed section practice.');
insert into public.mock_tests (student_id, label, taken_on, listening, reading, writing, speaking) values
  ('33333333-3333-3333-3333-000000000003', 'Mock #1 — Diagnostic', '2026-02-14', 5.5, 5, 5, 5.5);
insert into public.mock_tests (student_id, label, taken_on, listening, reading, writing, speaking) values
  ('33333333-3333-3333-3333-000000000003', 'Mock #2 — Cambridge 17', '2026-03-14', 6, 5.5, 5.5, 5.5);
insert into public.mock_tests (student_id, label, taken_on, listening, reading, writing, speaking) values
  ('33333333-3333-3333-3333-000000000003', 'Mock #3 — Cambridge 18', '2026-04-11', 6, 5.5, 5.5, 6);
insert into public.mock_tests (student_id, label, taken_on, listening, reading, writing, speaking) values
  ('33333333-3333-3333-3333-000000000003', 'Mock #4 — Midterm Mock', '2026-05-09', 6.5, 6, 5.5, 6);
insert into public.mock_tests (student_id, label, taken_on, listening, reading, writing, speaking) values
  ('33333333-3333-3333-3333-000000000003', 'Mock #5 — Cambridge 19', '2026-06-13', 6.5, 6, 6, 6.5);
insert into public.mock_tests (student_id, label, taken_on, listening, reading, writing, speaking) values
  ('33333333-3333-3333-3333-000000000003', 'Mock #6 — Full Simulation', '2026-07-11', 7, 6, 6, 6.5);
insert into public.recommendations (student_id, skill, priority, title, detail) values
  ('33333333-3333-3333-3333-000000000003', 'reading', 'high', 'Section 3 time management', 'Regularly leaves 6+ questions blank. Cap Section 1 at 15 minutes and practise skimming for paragraph gist first.');
insert into public.recommendations (student_id, skill, priority, title, detail) values
  ('33333333-3333-3333-3333-000000000003', 'writing', 'medium', 'Complex sentence variety', 'Over-relies on simple sentences. Target one conditional and one relative clause per paragraph.');

-- Aigerim Nurlanova
insert into public.students (id, center_id, teacher_id, name, initials, student_group, target_band, exam_date, attendance, teacher_note) values
  ('33333333-3333-3333-3333-000000000004', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'Aigerim Nurlanova', 'AN', 'IELTS Foundation', 7, '2026-11-14', 92, 'Aigerim participates actively and her vocabulary range is growing fast. Listening Section 4 remains the weak spot.');
insert into public.mock_tests (student_id, label, taken_on, listening, reading, writing, speaking) values
  ('33333333-3333-3333-3333-000000000004', 'Mock #1 — Diagnostic', '2026-02-14', 4.5, 5, 4.5, 5);
insert into public.mock_tests (student_id, label, taken_on, listening, reading, writing, speaking) values
  ('33333333-3333-3333-3333-000000000004', 'Mock #2 — Cambridge 17', '2026-03-14', 5, 5, 5, 5);
insert into public.mock_tests (student_id, label, taken_on, listening, reading, writing, speaking) values
  ('33333333-3333-3333-3333-000000000004', 'Mock #3 — Cambridge 18', '2026-04-11', 5, 5.5, 5, 5.5);
insert into public.mock_tests (student_id, label, taken_on, listening, reading, writing, speaking) values
  ('33333333-3333-3333-3333-000000000004', 'Mock #4 — Midterm Mock', '2026-05-09', 5.5, 5.5, 5, 5.5);
insert into public.mock_tests (student_id, label, taken_on, listening, reading, writing, speaking) values
  ('33333333-3333-3333-3333-000000000004', 'Mock #5 — Cambridge 19', '2026-06-13', 5.5, 6, 5.5, 6);
insert into public.mock_tests (student_id, label, taken_on, listening, reading, writing, speaking) values
  ('33333333-3333-3333-3333-000000000004', 'Mock #6 — Full Simulation', '2026-07-11', 6, 6, 5.5, 6);
insert into public.recommendations (student_id, skill, priority, title, detail) values
  ('33333333-3333-3333-3333-000000000004', 'listening', 'high', 'Section 4 academic monologues', 'Loses focus after minute 3. Practise note-completion with one TED-Ed talk per day, transcribing key nouns.');
insert into public.recommendations (student_id, skill, priority, title, detail) values
  ('33333333-3333-3333-3333-000000000004', 'writing', 'medium', 'Task 2 paragraph structure', 'Ideas are good but unordered. Use the PEEL frame (Point, Explain, Example, Link) for every body paragraph.');

-- Alikhan Tulegenov
insert into public.students (id, center_id, teacher_id, name, initials, student_group, target_band, exam_date, attendance, teacher_note) values
  ('33333333-3333-3333-3333-000000000005', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'Alikhan Tulegenov', 'AT', 'IELTS Intensive — Evening', 7.5, '2026-09-05', 94, 'Alikhan''s speaking is near-native in fluency. Writing grammar accuracy under time pressure is the last gap to 7.5.');
insert into public.mock_tests (student_id, label, taken_on, listening, reading, writing, speaking) values
  ('33333333-3333-3333-3333-000000000005', 'Mock #1 — Diagnostic', '2026-02-14', 6.5, 6, 5.5, 7);
insert into public.mock_tests (student_id, label, taken_on, listening, reading, writing, speaking) values
  ('33333333-3333-3333-3333-000000000005', 'Mock #2 — Cambridge 17', '2026-03-14', 6.5, 6.5, 6, 7);
insert into public.mock_tests (student_id, label, taken_on, listening, reading, writing, speaking) values
  ('33333333-3333-3333-3333-000000000005', 'Mock #3 — Cambridge 18', '2026-04-11', 7, 6.5, 6, 7.5);
insert into public.mock_tests (student_id, label, taken_on, listening, reading, writing, speaking) values
  ('33333333-3333-3333-3333-000000000005', 'Mock #4 — Midterm Mock', '2026-05-09', 7, 7, 6, 7.5);
insert into public.mock_tests (student_id, label, taken_on, listening, reading, writing, speaking) values
  ('33333333-3333-3333-3333-000000000005', 'Mock #5 — Cambridge 19', '2026-06-13', 7.5, 7, 6.5, 7.5);
insert into public.mock_tests (student_id, label, taken_on, listening, reading, writing, speaking) values
  ('33333333-3333-3333-3333-000000000005', 'Mock #6 — Full Simulation', '2026-07-11', 7.5, 7, 6.5, 8);
insert into public.recommendations (student_id, skill, priority, title, detail) values
  ('33333333-3333-3333-3333-000000000005', 'writing', 'high', 'Article and preposition accuracy', 'Recurring ''the/a'' omissions cost GRA marks. Self-edit checklist pass in the last 3 minutes of every task.');
insert into public.recommendations (student_id, skill, priority, title, detail) values
  ('33333333-3333-3333-3333-000000000005', 'reading', 'low', 'Matching headings strategy', 'Read the headings first and predict paragraph function before scanning.');

-- Madina Yessenova
insert into public.students (id, center_id, teacher_id, name, initials, student_group, target_band, exam_date, attendance, teacher_note) values
  ('33333333-3333-3333-3333-000000000006', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'Madina Yessenova', 'MY', 'IELTS Weekend Sprint', 7, '2026-08-29', 85, 'Madina made a strong jump this month after switching to daily listening drills. Keep momentum on Writing Task 1.');
insert into public.mock_tests (student_id, label, taken_on, listening, reading, writing, speaking) values
  ('33333333-3333-3333-3333-000000000006', 'Mock #1 — Diagnostic', '2026-02-14', 5.5, 6, 5, 5.5);
insert into public.mock_tests (student_id, label, taken_on, listening, reading, writing, speaking) values
  ('33333333-3333-3333-3333-000000000006', 'Mock #2 — Cambridge 17', '2026-03-14', 6, 6, 5.5, 6);
insert into public.mock_tests (student_id, label, taken_on, listening, reading, writing, speaking) values
  ('33333333-3333-3333-3333-000000000006', 'Mock #3 — Cambridge 18', '2026-04-11', 6.5, 6.5, 5.5, 6);
insert into public.mock_tests (student_id, label, taken_on, listening, reading, writing, speaking) values
  ('33333333-3333-3333-3333-000000000006', 'Mock #4 — Midterm Mock', '2026-05-09', 6.5, 6.5, 6, 6.5);
insert into public.mock_tests (student_id, label, taken_on, listening, reading, writing, speaking) values
  ('33333333-3333-3333-3333-000000000006', 'Mock #5 — Cambridge 19', '2026-06-13', 7, 6.5, 6, 6.5);
insert into public.mock_tests (student_id, label, taken_on, listening, reading, writing, speaking) values
  ('33333333-3333-3333-3333-000000000006', 'Mock #6 — Full Simulation', '2026-07-11', 7, 7, 6.5, 6.5);
insert into public.recommendations (student_id, skill, priority, title, detail) values
  ('33333333-3333-3333-3333-000000000006', 'writing', 'high', 'Task 1 data selection', 'Describes every data point equally. Pick the 2–3 most significant trends and group the rest.');
insert into public.recommendations (student_id, skill, priority, title, detail) values
  ('33333333-3333-3333-3333-000000000006', 'speaking', 'medium', 'Part 2 long-turn stamina', 'Runs out of ideas at 60 seconds. Practise the 5W1H expansion on cue cards daily.');

-- Nurislam Bekzhanov
insert into public.students (id, center_id, teacher_id, name, initials, student_group, target_band, exam_date, attendance, teacher_note) values
  ('33333333-3333-3333-3333-000000000007', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'Nurislam Bekzhanov', 'NB', 'IELTS Foundation', 6.5, '2026-12-05', 78, 'Nurislam''s attendance dipped in June — flagged for a parent check-in. Scores hold steady when he attends consistently.');
insert into public.mock_tests (student_id, label, taken_on, listening, reading, writing, speaking) values
  ('33333333-3333-3333-3333-000000000007', 'Mock #1 — Diagnostic', '2026-02-14', 4.5, 4.5, 4, 4.5);
insert into public.mock_tests (student_id, label, taken_on, listening, reading, writing, speaking) values
  ('33333333-3333-3333-3333-000000000007', 'Mock #2 — Cambridge 17', '2026-03-14', 5, 4.5, 4.5, 5);
insert into public.mock_tests (student_id, label, taken_on, listening, reading, writing, speaking) values
  ('33333333-3333-3333-3333-000000000007', 'Mock #3 — Cambridge 18', '2026-04-11', 5, 5, 4.5, 5);
insert into public.mock_tests (student_id, label, taken_on, listening, reading, writing, speaking) values
  ('33333333-3333-3333-3333-000000000007', 'Mock #4 — Midterm Mock', '2026-05-09', 5, 5, 4.5, 5);
insert into public.mock_tests (student_id, label, taken_on, listening, reading, writing, speaking) values
  ('33333333-3333-3333-3333-000000000007', 'Mock #5 — Cambridge 19', '2026-06-13', 5.5, 5, 5, 5.5);
insert into public.mock_tests (student_id, label, taken_on, listening, reading, writing, speaking) values
  ('33333333-3333-3333-3333-000000000007', 'Mock #6 — Full Simulation', '2026-07-11', 5.5, 5.5, 5, 5.5);
insert into public.recommendations (student_id, skill, priority, title, detail) values
  ('33333333-3333-3333-3333-000000000007', 'listening', 'high', 'Spelling in answer transfer', 'Loses 3–4 correct answers per test to spelling. Drill the top-100 IELTS listening nouns weekly.');
insert into public.recommendations (student_id, skill, priority, title, detail) values
  ('33333333-3333-3333-3333-000000000007', 'reading', 'medium', 'Vocabulary for paraphrase spotting', 'Build 10 synonym pairs per unit from Cambridge Vocabulary for IELTS.');

-- Tomiris Aitbayeva
insert into public.students (id, center_id, teacher_id, name, initials, student_group, target_band, exam_date, attendance, teacher_note) values
  ('33333333-3333-3333-3333-000000000008', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'Tomiris Aitbayeva', 'TA', 'IELTS Intensive — Morning', 7, '2026-09-26', 98, 'Tomiris is exceptionally consistent — never misses homework. Ready to push speaking beyond memorised structures.');
insert into public.mock_tests (student_id, label, taken_on, listening, reading, writing, speaking) values
  ('33333333-3333-3333-3333-000000000008', 'Mock #1 — Diagnostic', '2026-02-14', 6, 6, 5.5, 5.5);
insert into public.mock_tests (student_id, label, taken_on, listening, reading, writing, speaking) values
  ('33333333-3333-3333-3333-000000000008', 'Mock #2 — Cambridge 17', '2026-03-14', 6, 6.5, 5.5, 6);
insert into public.mock_tests (student_id, label, taken_on, listening, reading, writing, speaking) values
  ('33333333-3333-3333-3333-000000000008', 'Mock #3 — Cambridge 18', '2026-04-11', 6.5, 6.5, 6, 6);
insert into public.mock_tests (student_id, label, taken_on, listening, reading, writing, speaking) values
  ('33333333-3333-3333-3333-000000000008', 'Mock #4 — Midterm Mock', '2026-05-09', 6.5, 7, 6, 6);
insert into public.mock_tests (student_id, label, taken_on, listening, reading, writing, speaking) values
  ('33333333-3333-3333-3333-000000000008', 'Mock #5 — Cambridge 19', '2026-06-13', 7, 7, 6, 6.5);
insert into public.mock_tests (student_id, label, taken_on, listening, reading, writing, speaking) values
  ('33333333-3333-3333-3333-000000000008', 'Mock #6 — Full Simulation', '2026-07-11', 7, 7, 6.5, 6.5);
insert into public.recommendations (student_id, skill, priority, title, detail) values
  ('33333333-3333-3333-3333-000000000008', 'speaking', 'high', 'Natural responses over templates', 'Examiner will spot memorised chunks. Practise reacting to unexpected Part 3 questions with ''It depends…'' pivots.');
insert into public.recommendations (student_id, skill, priority, title, detail) values
  ('33333333-3333-3333-3333-000000000008', 'writing', 'low', 'Lexical range in Task 2', 'Upgrade high-frequency verbs: ''get → obtain / acquire'', ''big → substantial''.');

-- Bekarys Zhumagulov
insert into public.students (id, center_id, teacher_id, name, initials, student_group, target_band, exam_date, attendance, teacher_note) values
  ('33333333-3333-3333-3333-000000000009', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'Bekarys Zhumagulov', 'BZ', 'IELTS Weekend Sprint', 6.5, '2026-10-17', 90, 'Bekarys thinks deeply but hesitates in Speaking. Confidence drills are working — fluency is up a half-band.');
insert into public.mock_tests (student_id, label, taken_on, listening, reading, writing, speaking) values
  ('33333333-3333-3333-3333-000000000009', 'Mock #1 — Diagnostic', '2026-02-14', 5.5, 6, 5, 4.5);
insert into public.mock_tests (student_id, label, taken_on, listening, reading, writing, speaking) values
  ('33333333-3333-3333-3333-000000000009', 'Mock #2 — Cambridge 17', '2026-03-14', 5.5, 6, 5, 5);
insert into public.mock_tests (student_id, label, taken_on, listening, reading, writing, speaking) values
  ('33333333-3333-3333-3333-000000000009', 'Mock #3 — Cambridge 18', '2026-04-11', 6, 6, 5.5, 5);
insert into public.mock_tests (student_id, label, taken_on, listening, reading, writing, speaking) values
  ('33333333-3333-3333-3333-000000000009', 'Mock #4 — Midterm Mock', '2026-05-09', 6, 6.5, 5.5, 5.5);
insert into public.mock_tests (student_id, label, taken_on, listening, reading, writing, speaking) values
  ('33333333-3333-3333-3333-000000000009', 'Mock #5 — Cambridge 19', '2026-06-13', 6, 6.5, 5.5, 5.5);
insert into public.mock_tests (student_id, label, taken_on, listening, reading, writing, speaking) values
  ('33333333-3333-3333-3333-000000000009', 'Mock #6 — Full Simulation', '2026-07-11', 6.5, 6.5, 6, 6);
insert into public.recommendations (student_id, skill, priority, title, detail) values
  ('33333333-3333-3333-3333-000000000009', 'speaking', 'high', 'Reduce hesitation fillers', 'Long pauses before answers. Practise 3-second response starts: rephrase the question aloud while thinking.');
insert into public.recommendations (student_id, skill, priority, title, detail) values
  ('33333333-3333-3333-3333-000000000009', 'listening', 'medium', 'Map / plan labelling tasks', 'Confuses left/right orientation under pressure. Do 2 map tasks weekly with the audio at 1.25x.');

-- Zere Amangeldina
insert into public.students (id, center_id, teacher_id, name, initials, student_group, target_band, exam_date, attendance, teacher_note) values
  ('33333333-3333-3333-3333-000000000010', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'Zere Amangeldina', 'ZA', 'IELTS Intensive — Evening', 8, '2026-08-15', 97, 'Zere is two weeks from exam day and trending at 7.5. Final focus: Writing Task 2 position clarity for the 8.0 push.');
insert into public.mock_tests (student_id, label, taken_on, listening, reading, writing, speaking) values
  ('33333333-3333-3333-3333-000000000010', 'Mock #1 — Diagnostic', '2026-02-14', 7, 7, 6, 6.5);
insert into public.mock_tests (student_id, label, taken_on, listening, reading, writing, speaking) values
  ('33333333-3333-3333-3333-000000000010', 'Mock #2 — Cambridge 17', '2026-03-14', 7.5, 7, 6.5, 7);
insert into public.mock_tests (student_id, label, taken_on, listening, reading, writing, speaking) values
  ('33333333-3333-3333-3333-000000000010', 'Mock #3 — Cambridge 18', '2026-04-11', 7.5, 7.5, 6.5, 7);
insert into public.mock_tests (student_id, label, taken_on, listening, reading, writing, speaking) values
  ('33333333-3333-3333-3333-000000000010', 'Mock #4 — Midterm Mock', '2026-05-09', 8, 7.5, 6.5, 7.5);
insert into public.mock_tests (student_id, label, taken_on, listening, reading, writing, speaking) values
  ('33333333-3333-3333-3333-000000000010', 'Mock #5 — Cambridge 19', '2026-06-13', 8, 8, 7, 7.5);
insert into public.mock_tests (student_id, label, taken_on, listening, reading, writing, speaking) values
  ('33333333-3333-3333-3333-000000000010', 'Mock #6 — Full Simulation', '2026-07-11', 8.5, 8, 7, 7.5);
insert into public.recommendations (student_id, skill, priority, title, detail) values
  ('33333333-3333-3333-3333-000000000010', 'writing', 'high', 'Thesis position in Task 2', 'Position appears only in the conclusion. State a clear opinion in the introduction and echo it in every paragraph.');
insert into public.recommendations (student_id, skill, priority, title, detail) values
  ('33333333-3333-3333-3333-000000000010', 'speaking', 'low', 'Intonation variety', 'Delivery is accurate but flat. Mark stress words in practice answers and exaggerate on record-and-review.');

-- Sanzhar Orazbekov
insert into public.students (id, center_id, teacher_id, name, initials, student_group, target_band, exam_date, attendance, teacher_note) values
  ('33333333-3333-3333-3333-000000000011', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'Sanzhar Orazbekov', 'SO', 'IELTS Foundation', 6.5, '2026-11-28', 91, 'Sanzhar joined mid-term and is catching up quickly. Grammar foundations are solid; vocabulary breadth is the priority.');
insert into public.mock_tests (student_id, label, taken_on, listening, reading, writing, speaking) values
  ('33333333-3333-3333-3333-000000000011', 'Mock #1 — Diagnostic', '2026-02-14', 5, 4.5, 4.5, 5);
insert into public.mock_tests (student_id, label, taken_on, listening, reading, writing, speaking) values
  ('33333333-3333-3333-3333-000000000011', 'Mock #2 — Cambridge 17', '2026-03-14', 5, 5, 5, 5);
insert into public.mock_tests (student_id, label, taken_on, listening, reading, writing, speaking) values
  ('33333333-3333-3333-3333-000000000011', 'Mock #3 — Cambridge 18', '2026-04-11', 5.5, 5, 5, 5.5);
insert into public.mock_tests (student_id, label, taken_on, listening, reading, writing, speaking) values
  ('33333333-3333-3333-3333-000000000011', 'Mock #4 — Midterm Mock', '2026-05-09', 5.5, 5.5, 5, 5.5);
insert into public.mock_tests (student_id, label, taken_on, listening, reading, writing, speaking) values
  ('33333333-3333-3333-3333-000000000011', 'Mock #5 — Cambridge 19', '2026-06-13', 6, 5.5, 5.5, 6);
insert into public.mock_tests (student_id, label, taken_on, listening, reading, writing, speaking) values
  ('33333333-3333-3333-3333-000000000011', 'Mock #6 — Full Simulation', '2026-07-11', 6, 6, 5.5, 6);
insert into public.recommendations (student_id, skill, priority, title, detail) values
  ('33333333-3333-3333-3333-000000000011', 'reading', 'high', 'Academic word list coverage', 'Unknown vocabulary blocks comprehension. Work through AWL sublists 1–3 with spaced repetition.');
insert into public.recommendations (student_id, skill, priority, title, detail) values
  ('33333333-3333-3333-3333-000000000011', 'writing', 'medium', 'Task response completeness', 'Often answers only half of two-part questions. Underline both parts of the prompt before planning.');

-- Kamila Dauletova
insert into public.students (id, center_id, teacher_id, name, initials, student_group, target_band, exam_date, attendance, teacher_note) values
  ('33333333-3333-3333-3333-000000000012', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'Kamila Dauletova', 'KD', 'IELTS Weekend Sprint', 7.5, '2026-10-10', 95, 'Kamila balances school olympiads with IELTS prep impressively. Reading is already at target — hold and polish Writing.');
insert into public.mock_tests (student_id, label, taken_on, listening, reading, writing, speaking) values
  ('33333333-3333-3333-3333-000000000012', 'Mock #1 — Diagnostic', '2026-02-14', 6, 6.5, 5.5, 6);
insert into public.mock_tests (student_id, label, taken_on, listening, reading, writing, speaking) values
  ('33333333-3333-3333-3333-000000000012', 'Mock #2 — Cambridge 17', '2026-03-14', 6.5, 7, 6, 6);
insert into public.mock_tests (student_id, label, taken_on, listening, reading, writing, speaking) values
  ('33333333-3333-3333-3333-000000000012', 'Mock #3 — Cambridge 18', '2026-04-11', 6.5, 7, 6, 6.5);
insert into public.mock_tests (student_id, label, taken_on, listening, reading, writing, speaking) values
  ('33333333-3333-3333-3333-000000000012', 'Mock #4 — Midterm Mock', '2026-05-09', 7, 7.5, 6, 6.5);
insert into public.mock_tests (student_id, label, taken_on, listening, reading, writing, speaking) values
  ('33333333-3333-3333-3333-000000000012', 'Mock #5 — Cambridge 19', '2026-06-13', 7, 7.5, 6.5, 7);
insert into public.mock_tests (student_id, label, taken_on, listening, reading, writing, speaking) values
  ('33333333-3333-3333-3333-000000000012', 'Mock #6 — Full Simulation', '2026-07-11', 7.5, 7.5, 6.5, 7);
insert into public.recommendations (student_id, skill, priority, title, detail) values
  ('33333333-3333-3333-3333-000000000012', 'writing', 'high', 'Cohesion without mechanical linkers', 'Overuses ''Firstly / Secondly / In conclusion''. Vary with referencing (''this trend'', ''such measures'').');
insert into public.recommendations (student_id, skill, priority, title, detail) values
  ('33333333-3333-3333-3333-000000000012', 'listening', 'low', 'Multiple-choice distractor traps', 'Watch for corrections mid-audio (''actually, on second thought…'') in Section 2.');
