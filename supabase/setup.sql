-- EduFlow — one-shot setup: schema + RLS + seed.
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

-- Idempotent: drop existing policies so this migration can be re-applied.
drop policy if exists "centers_select_own"        on public.language_centers;
drop policy if exists "teachers_select_center"    on public.teachers;
drop policy if exists "students_rw_center"        on public.students;
drop policy if exists "mock_tests_rw_center"      on public.mock_tests;
drop policy if exists "recommendations_rw_center" on public.recommendations;
drop policy if exists "parent_reports_rw_center"  on public.parent_reports;

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


-- IELTS Pulse — Cambridge practice engine schema
-- Structured test materials + student submissions. Idempotent + RLS-enabled.

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table if not exists public.cambridge_tests (
  id           uuid primary key default gen_random_uuid(),
  book_number  int not null,
  test_number  int not null,
  title        text not null,
  section_type text not null check (section_type in ('listening', 'reading', 'writing', 'speaking')),
  created_at   timestamptz not null default now()
);

create table if not exists public.test_passages (
  id             uuid primary key default gen_random_uuid(),
  test_id        uuid not null references public.cambridge_tests (id) on delete cascade,
  passage_number int not null,
  title          text not null,
  text_content   text not null,
  audio_url      text,
  created_at     timestamptz not null default now()
);

create table if not exists public.test_questions (
  id              uuid primary key default gen_random_uuid(),
  passage_id      uuid not null references public.test_passages (id) on delete cascade,
  question_number int not null,
  question_type   text not null check (question_type in ('mcq', 'true_false_not_given', 'fill_blanks', 'matching')),
  prompt          text not null,
  options         jsonb,
  correct_answer  text not null,
  explanation     text,
  created_at      timestamptz not null default now()
);

create table if not exists public.student_submissions (
  id           uuid primary key default gen_random_uuid(),
  student_id   uuid references public.students (id) on delete cascade,
  test_id      uuid references public.cambridge_tests (id) on delete set null,
  answers      jsonb not null default '{}'::jsonb,
  band_score   numeric(2, 1),
  completed_at timestamptz not null default now(),
  created_at   timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------

create index if not exists cambridge_tests_section_idx    on public.cambridge_tests (section_type);
create index if not exists test_passages_test_id_idx      on public.test_passages (test_id);
create index if not exists test_questions_passage_id_idx  on public.test_questions (passage_id);
create index if not exists submissions_student_id_idx     on public.student_submissions (student_id);
create index if not exists submissions_test_id_idx        on public.student_submissions (test_id);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
-- Content tables carry answer keys, so they stay behind the service role (the
-- app reads them server-side and never ships correct_answer to the browser).
-- Submissions are scoped per-centre for the future authenticated model.

alter table public.cambridge_tests     enable row level security;
alter table public.test_passages       enable row level security;
alter table public.test_questions      enable row level security;
alter table public.student_submissions enable row level security;

drop policy if exists "submissions_rw_center" on public.student_submissions;
create policy "submissions_rw_center" on public.student_submissions
  for all
  using (student_id in (
    select id from public.students where center_id in (select public.current_user_center_ids())
  ))
  with check (student_id in (
    select id from public.students where center_id in (select public.current_user_center_ids())
  ));


-- EduFlow — user profiles + roles for Supabase Auth.
-- Idempotent. A trigger mirrors auth.users metadata into public.profiles so
-- both self sign-up and admin-created demo accounts get a profile row.

create table if not exists public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  role       text not null default 'student' check (role in ('teacher', 'student', 'parent')),
  full_name  text not null default '',
  student_id uuid references public.students (id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists profiles_role_idx on public.profiles (role);

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);

-- Auto-provision a profile from user metadata on signup / admin create.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, role, full_name, student_id)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'role', 'student'),
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    nullif(new.raw_user_meta_data ->> 'student_id', '')::uuid
  )
  on conflict (id) do update
    set role = excluded.role,
        full_name = excluded.full_name,
        student_id = excluded.student_id;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- EduFlow — group management: groups, homework, submissions, attendance.
-- Idempotent + RLS-enabled (content served server-side via the service role).

create table if not exists public.groups (
  id         uuid primary key default gen_random_uuid(),
  name       text not null unique,
  schedule   text,
  created_at timestamptz not null default now()
);

create table if not exists public.homework (
  id          uuid primary key default gen_random_uuid(),
  group_name  text not null,
  title       text not null,
  description text,
  section     text not null default 'general'
                check (section in ('listening', 'reading', 'writing', 'speaking', 'general')),
  due_date    date,
  created_at  timestamptz not null default now()
);

create table if not exists public.homework_submissions (
  id           uuid primary key default gen_random_uuid(),
  homework_id  uuid not null references public.homework (id) on delete cascade,
  student_id   uuid not null references public.students (id) on delete cascade,
  content      text,
  status       text not null default 'assigned'
                 check (status in ('assigned', 'submitted', 'graded')),
  band_score   numeric(2, 1),
  feedback     text,
  submitted_at timestamptz,
  created_at   timestamptz not null default now(),
  unique (homework_id, student_id)
);

create table if not exists public.attendance (
  id         uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students (id) on delete cascade,
  group_name text,
  date       date not null,
  status     text not null check (status in ('present', 'absent', 'late')),
  created_at timestamptz not null default now(),
  unique (student_id, date)
);

create index if not exists homework_group_idx        on public.homework (group_name);
create index if not exists hw_submissions_hw_idx      on public.homework_submissions (homework_id);
create index if not exists hw_submissions_student_idx on public.homework_submissions (student_id);
create index if not exists attendance_student_idx     on public.attendance (student_id);
create index if not exists attendance_date_idx        on public.attendance (date);

alter table public.groups                enable row level security;
alter table public.homework              enable row level security;
alter table public.homework_submissions  enable row level security;
alter table public.attendance            enable row level security;

-- Submissions + attendance scoped to the teacher's centre (via the student).
drop policy if exists "hw_submissions_rw_center" on public.homework_submissions;
create policy "hw_submissions_rw_center" on public.homework_submissions
  for all
  using (student_id in (
    select id from public.students where center_id in (select public.current_user_center_ids())
  ))
  with check (student_id in (
    select id from public.students where center_id in (select public.current_user_center_ids())
  ));

drop policy if exists "attendance_rw_center" on public.attendance;
create policy "attendance_rw_center" on public.attendance
  for all
  using (student_id in (
    select id from public.students where center_id in (select public.current_user_center_ids())
  ))
  with check (student_id in (
    select id from public.students where center_id in (select public.current_user_center_ids())
  ));


-- IELTS Pulse — seed data (generated by scripts/gen-seed.ts).
-- Safe to re-run: centre/teacher/students upsert by fixed id;
-- child rows are deleted for these students then re-inserted.

insert into public.language_centers (id, name, slug) values
  ('11111111-1111-1111-1111-111111111111', 'Astana English Academy', 'astana-english-academy')
  on conflict (id) do nothing;

insert into public.teachers (id, center_id, name, role) values
  ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'Дана Искакова', 'director')
  on conflict (id) do nothing;

delete from public.students where id in ('33333333-3333-3333-3333-000000000001', '33333333-3333-3333-3333-000000000002', '33333333-3333-3333-3333-000000000003', '33333333-3333-3333-3333-000000000004', '33333333-3333-3333-3333-000000000005', '33333333-3333-3333-3333-000000000006', '33333333-3333-3333-3333-000000000007', '33333333-3333-3333-3333-000000000008', '33333333-3333-3333-3333-000000000009', '33333333-3333-3333-3333-000000000010', '33333333-3333-3333-3333-000000000011', '33333333-3333-3333-3333-000000000012');

-- Арман Калибеков
insert into public.students (id, center_id, teacher_id, name, initials, student_group, target_band, exam_date, attendance, teacher_note) values
  ('33333333-3333-3333-3333-000000000001', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'Арман Калибеков', 'АК', 'IELTS 62', 7.5, '2026-09-19', 96, 'Арман показывает отличный прогресс в Listening. Нужно поработать над лексикой и связками в Writing Task 2.');
insert into public.mock_tests (student_id, label, taken_on, listening, reading, writing, speaking) values
  ('33333333-3333-3333-3333-000000000001', 'Mock #1 — Диагностика', '2026-02-14', 6, 5.5, 5, 5.5);
insert into public.mock_tests (student_id, label, taken_on, listening, reading, writing, speaking) values
  ('33333333-3333-3333-3333-000000000001', 'Mock #2 — Cambridge 17', '2026-03-14', 6.5, 6, 5.5, 6);
insert into public.mock_tests (student_id, label, taken_on, listening, reading, writing, speaking) values
  ('33333333-3333-3333-3333-000000000001', 'Mock #3 — Cambridge 18', '2026-04-11', 6.5, 6.5, 5.5, 6);
insert into public.mock_tests (student_id, label, taken_on, listening, reading, writing, speaking) values
  ('33333333-3333-3333-3333-000000000001', 'Mock #4 — Промежуточный', '2026-05-09', 7, 6.5, 6, 6.5);
insert into public.mock_tests (student_id, label, taken_on, listening, reading, writing, speaking) values
  ('33333333-3333-3333-3333-000000000001', 'Mock #5 — Cambridge 19', '2026-06-13', 7.5, 6.5, 6, 6.5);
insert into public.mock_tests (student_id, label, taken_on, listening, reading, writing, speaking) values
  ('33333333-3333-3333-3333-000000000001', 'Mock #6 — Полная симуляция', '2026-07-11', 7.5, 7, 6, 7);
insert into public.recommendations (student_id, skill, priority, title, detail) values
  ('33333333-3333-3333-3333-000000000001', 'writing', 'high', 'Связность в Task 2 требует связок', 'Эссе теряют баллы за логику изложения. Отработайте «however / consequently / in contrast» и тематические предложения абзацев — 3 вступления на время за эту неделю.');
insert into public.recommendations (student_id, skill, priority, title, detail) values
  ('33333333-3333-3333-3333-000000000001', 'reading', 'medium', 'Точность в True / False / Not Given', 'Сейчас 6/13 в заданиях TFNG. Тренируйтесь находить точное предложение перед выбором ответа — Cambridge 18, тесты 2–4.');
insert into public.recommendations (student_id, skill, priority, title, detail) values
  ('33333333-3333-3333-3333-000000000001', 'speaking', 'low', 'Глубина ответов в Part 3', 'Ответы беглые, но короткие. Используйте схему «мнение → причина → пример», чтобы ответы длились дольше 30 секунд.');

-- Аружан Мукашева
insert into public.students (id, center_id, teacher_id, name, initials, student_group, target_band, exam_date, attendance, teacher_note) values
  ('33333333-3333-3333-3333-000000000002', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'Аружан Мукашева', 'АМ', 'Advanced 34', 8, '2026-08-22', 100, 'Аружан — наш сильнейший читатель. Беглость речи отличная; отточите произношение сочетаний согласных для 8.0.');
insert into public.mock_tests (student_id, label, taken_on, listening, reading, writing, speaking) values
  ('33333333-3333-3333-3333-000000000002', 'Mock #1 — Диагностика', '2026-02-14', 7, 7.5, 6, 6.5);
insert into public.mock_tests (student_id, label, taken_on, listening, reading, writing, speaking) values
  ('33333333-3333-3333-3333-000000000002', 'Mock #2 — Cambridge 17', '2026-03-14', 7, 7.5, 6.5, 7);
insert into public.mock_tests (student_id, label, taken_on, listening, reading, writing, speaking) values
  ('33333333-3333-3333-3333-000000000002', 'Mock #3 — Cambridge 18', '2026-04-11', 7.5, 8, 6.5, 7);
insert into public.mock_tests (student_id, label, taken_on, listening, reading, writing, speaking) values
  ('33333333-3333-3333-3333-000000000002', 'Mock #4 — Промежуточный', '2026-05-09', 7.5, 8, 6.5, 7.5);
insert into public.mock_tests (student_id, label, taken_on, listening, reading, writing, speaking) values
  ('33333333-3333-3333-3333-000000000002', 'Mock #5 — Cambridge 19', '2026-06-13', 8, 8.5, 7, 7.5);
insert into public.mock_tests (student_id, label, taken_on, listening, reading, writing, speaking) values
  ('33333333-3333-3333-3333-000000000002', 'Mock #6 — Полная симуляция', '2026-07-11', 8, 8.5, 7, 7.5);
insert into public.recommendations (student_id, skill, priority, title, detail) values
  ('33333333-3333-3333-3333-000000000002', 'writing', 'high', 'Обзорное предложение в Task 1', 'Отчёты сразу переходят к данным. Начинайте с двух предложений об основных тенденциях до любых цифр.');
insert into public.recommendations (student_id, skill, priority, title, detail) values
  ('33333333-3333-3333-3333-000000000002', 'speaking', 'medium', 'Произношение сочетаний согласных', '«Sixth», «strengths», «crisps» — по 10 минут в день повторяйте за BBC 6-Minute English.');

-- Диас Серикбай
insert into public.students (id, center_id, teacher_id, name, initials, student_group, target_band, exam_date, attendance, teacher_note) values
  ('33333333-3333-3333-3333-000000000003', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'Диас Серикбай', 'ДС', 'Intermediate 45', 7, '2026-10-03', 88, 'Диас поднял Listening на полбалла за семестр. Главный барьер — скорость чтения; нужна работа с секциями на время.');
insert into public.mock_tests (student_id, label, taken_on, listening, reading, writing, speaking) values
  ('33333333-3333-3333-3333-000000000003', 'Mock #1 — Диагностика', '2026-02-14', 5.5, 5, 5, 5.5);
insert into public.mock_tests (student_id, label, taken_on, listening, reading, writing, speaking) values
  ('33333333-3333-3333-3333-000000000003', 'Mock #2 — Cambridge 17', '2026-03-14', 6, 5.5, 5.5, 5.5);
insert into public.mock_tests (student_id, label, taken_on, listening, reading, writing, speaking) values
  ('33333333-3333-3333-3333-000000000003', 'Mock #3 — Cambridge 18', '2026-04-11', 6, 5.5, 5.5, 6);
insert into public.mock_tests (student_id, label, taken_on, listening, reading, writing, speaking) values
  ('33333333-3333-3333-3333-000000000003', 'Mock #4 — Промежуточный', '2026-05-09', 6.5, 6, 5.5, 6);
insert into public.mock_tests (student_id, label, taken_on, listening, reading, writing, speaking) values
  ('33333333-3333-3333-3333-000000000003', 'Mock #5 — Cambridge 19', '2026-06-13', 6.5, 6, 6, 6.5);
insert into public.mock_tests (student_id, label, taken_on, listening, reading, writing, speaking) values
  ('33333333-3333-3333-3333-000000000003', 'Mock #6 — Полная симуляция', '2026-07-11', 7, 6, 6, 6.5);
insert into public.recommendations (student_id, skill, priority, title, detail) values
  ('33333333-3333-3333-3333-000000000003', 'reading', 'high', 'Тайм-менеджмент в Section 3', 'Регулярно оставляет 6+ вопросов без ответа. Ограничьте Section 1 15 минутами и тренируйте беглый просмотр для понимания сути абзаца.');
insert into public.recommendations (student_id, skill, priority, title, detail) values
  ('33333333-3333-3333-3333-000000000003', 'writing', 'medium', 'Разнообразие сложных предложений', 'Слишком много простых предложений. Цель — одно условное и одно определительное придаточное в каждом абзаце.');

-- Айгерим Нурланова
insert into public.students (id, center_id, teacher_id, name, initials, student_group, target_band, exam_date, attendance, teacher_note) values
  ('33333333-3333-3333-3333-000000000004', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'Айгерим Нурланова', 'АН', 'Intermediate 45', 7, '2026-11-14', 92, 'Айгерим активно участвует, её словарный запас быстро растёт. Слабое место — Listening Section 4.');
insert into public.mock_tests (student_id, label, taken_on, listening, reading, writing, speaking) values
  ('33333333-3333-3333-3333-000000000004', 'Mock #1 — Диагностика', '2026-02-14', 4.5, 5, 4.5, 5);
insert into public.mock_tests (student_id, label, taken_on, listening, reading, writing, speaking) values
  ('33333333-3333-3333-3333-000000000004', 'Mock #2 — Cambridge 17', '2026-03-14', 5, 5, 5, 5);
insert into public.mock_tests (student_id, label, taken_on, listening, reading, writing, speaking) values
  ('33333333-3333-3333-3333-000000000004', 'Mock #3 — Cambridge 18', '2026-04-11', 5, 5.5, 5, 5.5);
insert into public.mock_tests (student_id, label, taken_on, listening, reading, writing, speaking) values
  ('33333333-3333-3333-3333-000000000004', 'Mock #4 — Промежуточный', '2026-05-09', 5.5, 5.5, 5, 5.5);
insert into public.mock_tests (student_id, label, taken_on, listening, reading, writing, speaking) values
  ('33333333-3333-3333-3333-000000000004', 'Mock #5 — Cambridge 19', '2026-06-13', 5.5, 6, 5.5, 6);
insert into public.mock_tests (student_id, label, taken_on, listening, reading, writing, speaking) values
  ('33333333-3333-3333-3333-000000000004', 'Mock #6 — Полная симуляция', '2026-07-11', 6, 6, 5.5, 6);
insert into public.recommendations (student_id, skill, priority, title, detail) values
  ('33333333-3333-3333-3333-000000000004', 'listening', 'high', 'Академические монологи в Section 4', 'Теряет концентрацию после 3-й минуты. Тренируйте заполнение пропусков по одному ролику TED-Ed в день, выписывая ключевые существительные.');
insert into public.recommendations (student_id, skill, priority, title, detail) values
  ('33333333-3333-3333-3333-000000000004', 'writing', 'medium', 'Структура абзацев в Task 2', 'Идеи хорошие, но не упорядочены. Используйте схему PEEL (Point, Explain, Example, Link) для каждого абзаца.');

-- Алихан Тулегенов
insert into public.students (id, center_id, teacher_id, name, initials, student_group, target_band, exam_date, attendance, teacher_note) values
  ('33333333-3333-3333-3333-000000000005', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'Алихан Тулегенов', 'АТ', 'IELTS 62', 7.5, '2026-09-05', 94, 'Речь Алихана почти как у носителя по беглости. Последний барьер к 7.5 — грамматическая точность в Writing под давлением времени.');
insert into public.mock_tests (student_id, label, taken_on, listening, reading, writing, speaking) values
  ('33333333-3333-3333-3333-000000000005', 'Mock #1 — Диагностика', '2026-02-14', 6.5, 6, 5.5, 7);
insert into public.mock_tests (student_id, label, taken_on, listening, reading, writing, speaking) values
  ('33333333-3333-3333-3333-000000000005', 'Mock #2 — Cambridge 17', '2026-03-14', 6.5, 6.5, 6, 7);
insert into public.mock_tests (student_id, label, taken_on, listening, reading, writing, speaking) values
  ('33333333-3333-3333-3333-000000000005', 'Mock #3 — Cambridge 18', '2026-04-11', 7, 6.5, 6, 7.5);
insert into public.mock_tests (student_id, label, taken_on, listening, reading, writing, speaking) values
  ('33333333-3333-3333-3333-000000000005', 'Mock #4 — Промежуточный', '2026-05-09', 7, 7, 6, 7.5);
insert into public.mock_tests (student_id, label, taken_on, listening, reading, writing, speaking) values
  ('33333333-3333-3333-3333-000000000005', 'Mock #5 — Cambridge 19', '2026-06-13', 7.5, 7, 6.5, 7.5);
insert into public.mock_tests (student_id, label, taken_on, listening, reading, writing, speaking) values
  ('33333333-3333-3333-3333-000000000005', 'Mock #6 — Полная симуляция', '2026-07-11', 7.5, 7, 6.5, 8);
insert into public.recommendations (student_id, skill, priority, title, detail) values
  ('33333333-3333-3333-3333-000000000005', 'writing', 'high', 'Точность артиклей и предлогов', 'Повторяющиеся пропуски «the/a» стоят баллов по GRA. Делайте проверку по чек-листу в последние 3 минуты каждого задания.');
insert into public.recommendations (student_id, skill, priority, title, detail) values
  ('33333333-3333-3333-3333-000000000005', 'reading', 'low', 'Стратегия matching headings', 'Сначала читайте заголовки и предполагайте функцию абзаца до сканирования текста.');

-- Мадина Есенова
insert into public.students (id, center_id, teacher_id, name, initials, student_group, target_band, exam_date, attendance, teacher_note) values
  ('33333333-3333-3333-3333-000000000006', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'Мадина Есенова', 'МЕ', 'IELTS 63 (Weekend)', 7, '2026-08-29', 85, 'Мадина заметно продвинулась за месяц после перехода на ежедневные упражнения по Listening. Держите темп в Writing Task 1.');
insert into public.mock_tests (student_id, label, taken_on, listening, reading, writing, speaking) values
  ('33333333-3333-3333-3333-000000000006', 'Mock #1 — Диагностика', '2026-02-14', 5.5, 6, 5, 5.5);
insert into public.mock_tests (student_id, label, taken_on, listening, reading, writing, speaking) values
  ('33333333-3333-3333-3333-000000000006', 'Mock #2 — Cambridge 17', '2026-03-14', 6, 6, 5.5, 6);
insert into public.mock_tests (student_id, label, taken_on, listening, reading, writing, speaking) values
  ('33333333-3333-3333-3333-000000000006', 'Mock #3 — Cambridge 18', '2026-04-11', 6.5, 6.5, 5.5, 6);
insert into public.mock_tests (student_id, label, taken_on, listening, reading, writing, speaking) values
  ('33333333-3333-3333-3333-000000000006', 'Mock #4 — Промежуточный', '2026-05-09', 6.5, 6.5, 6, 6.5);
insert into public.mock_tests (student_id, label, taken_on, listening, reading, writing, speaking) values
  ('33333333-3333-3333-3333-000000000006', 'Mock #5 — Cambridge 19', '2026-06-13', 7, 6.5, 6, 6.5);
insert into public.mock_tests (student_id, label, taken_on, listening, reading, writing, speaking) values
  ('33333333-3333-3333-3333-000000000006', 'Mock #6 — Полная симуляция', '2026-07-11', 7, 7, 6.5, 6.5);
insert into public.recommendations (student_id, skill, priority, title, detail) values
  ('33333333-3333-3333-3333-000000000006', 'writing', 'high', 'Выбор данных в Task 1', 'Описывает все данные одинаково. Выберите 2–3 самые важные тенденции, остальное сгруппируйте.');
insert into public.recommendations (student_id, skill, priority, title, detail) values
  ('33333333-3333-3333-3333-000000000006', 'speaking', 'medium', 'Выносливость в длинном ответе Part 2', 'Идеи заканчиваются на 60-й секунде. Ежедневно тренируйте расширение по схеме 5W1H на карточках.');

-- Нурислам Бекжанов
insert into public.students (id, center_id, teacher_id, name, initials, student_group, target_band, exam_date, attendance, teacher_note) values
  ('33333333-3333-3333-3333-000000000007', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'Нурислам Бекжанов', 'НБ', 'Pre-Intermediate 12', 6.5, '2026-12-05', 78, 'Посещаемость Нурислама снизилась в июне — отмечен для беседы с родителями. При регулярном посещении баллы держатся стабильно.');
insert into public.mock_tests (student_id, label, taken_on, listening, reading, writing, speaking) values
  ('33333333-3333-3333-3333-000000000007', 'Mock #1 — Диагностика', '2026-02-14', 4.5, 4.5, 4, 4.5);
insert into public.mock_tests (student_id, label, taken_on, listening, reading, writing, speaking) values
  ('33333333-3333-3333-3333-000000000007', 'Mock #2 — Cambridge 17', '2026-03-14', 5, 4.5, 4.5, 5);
insert into public.mock_tests (student_id, label, taken_on, listening, reading, writing, speaking) values
  ('33333333-3333-3333-3333-000000000007', 'Mock #3 — Cambridge 18', '2026-04-11', 5, 5, 4.5, 5);
insert into public.mock_tests (student_id, label, taken_on, listening, reading, writing, speaking) values
  ('33333333-3333-3333-3333-000000000007', 'Mock #4 — Промежуточный', '2026-05-09', 5, 5, 4.5, 5);
insert into public.mock_tests (student_id, label, taken_on, listening, reading, writing, speaking) values
  ('33333333-3333-3333-3333-000000000007', 'Mock #5 — Cambridge 19', '2026-06-13', 5.5, 5, 5, 5.5);
insert into public.mock_tests (student_id, label, taken_on, listening, reading, writing, speaking) values
  ('33333333-3333-3333-3333-000000000007', 'Mock #6 — Полная симуляция', '2026-07-11', 5.5, 5.5, 5, 5.5);
insert into public.recommendations (student_id, skill, priority, title, detail) values
  ('33333333-3333-3333-3333-000000000007', 'listening', 'high', 'Орфография при переносе ответов', 'Теряет 3–4 верных ответа за тест из-за орфографии. Еженедельно отрабатывайте топ-100 существительных IELTS Listening.');
insert into public.recommendations (student_id, skill, priority, title, detail) values
  ('33333333-3333-3333-3333-000000000007', 'reading', 'medium', 'Лексика для распознавания перефраза', 'Составляйте по 10 пар синонимов на юнит из Cambridge Vocabulary for IELTS.');

-- Томирис Айтбаева
insert into public.students (id, center_id, teacher_id, name, initials, student_group, target_band, exam_date, attendance, teacher_note) values
  ('33333333-3333-3333-3333-000000000008', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'Томирис Айтбаева', 'ТА', 'Intermediate 45', 7, '2026-09-26', 98, 'Томирис исключительно стабильна — никогда не пропускает домашние задания. Готова выйти за рамки заученных структур в Speaking.');
insert into public.mock_tests (student_id, label, taken_on, listening, reading, writing, speaking) values
  ('33333333-3333-3333-3333-000000000008', 'Mock #1 — Диагностика', '2026-02-14', 6, 6, 5.5, 5.5);
insert into public.mock_tests (student_id, label, taken_on, listening, reading, writing, speaking) values
  ('33333333-3333-3333-3333-000000000008', 'Mock #2 — Cambridge 17', '2026-03-14', 6, 6.5, 5.5, 6);
insert into public.mock_tests (student_id, label, taken_on, listening, reading, writing, speaking) values
  ('33333333-3333-3333-3333-000000000008', 'Mock #3 — Cambridge 18', '2026-04-11', 6.5, 6.5, 6, 6);
insert into public.mock_tests (student_id, label, taken_on, listening, reading, writing, speaking) values
  ('33333333-3333-3333-3333-000000000008', 'Mock #4 — Промежуточный', '2026-05-09', 6.5, 7, 6, 6);
insert into public.mock_tests (student_id, label, taken_on, listening, reading, writing, speaking) values
  ('33333333-3333-3333-3333-000000000008', 'Mock #5 — Cambridge 19', '2026-06-13', 7, 7, 6, 6.5);
insert into public.mock_tests (student_id, label, taken_on, listening, reading, writing, speaking) values
  ('33333333-3333-3333-3333-000000000008', 'Mock #6 — Полная симуляция', '2026-07-11', 7, 7, 6.5, 6.5);
insert into public.recommendations (student_id, skill, priority, title, detail) values
  ('33333333-3333-3333-3333-000000000008', 'speaking', 'high', 'Естественные ответы вместо шаблонов', 'Экзаменатор заметит заученные фразы. Тренируйте реакцию на неожиданные вопросы Part 3 через связки «It depends…».');
insert into public.recommendations (student_id, skill, priority, title, detail) values
  ('33333333-3333-3333-3333-000000000008', 'writing', 'low', 'Разнообразие лексики в Task 2', 'Заменяйте частотные глаголы: «get → obtain / acquire», «big → substantial».');

-- Бекарыс Жумагулов
insert into public.students (id, center_id, teacher_id, name, initials, student_group, target_band, exam_date, attendance, teacher_note) values
  ('33333333-3333-3333-3333-000000000009', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'Бекарыс Жумагулов', 'БЖ', 'Pre-Intermediate 12', 6.5, '2026-10-17', 90, 'Бекарыс мыслит глубоко, но неуверен в Speaking. Упражнения на уверенность работают — беглость выросла на полбалла.');
insert into public.mock_tests (student_id, label, taken_on, listening, reading, writing, speaking) values
  ('33333333-3333-3333-3333-000000000009', 'Mock #1 — Диагностика', '2026-02-14', 5.5, 6, 5, 4.5);
insert into public.mock_tests (student_id, label, taken_on, listening, reading, writing, speaking) values
  ('33333333-3333-3333-3333-000000000009', 'Mock #2 — Cambridge 17', '2026-03-14', 5.5, 6, 5, 5);
insert into public.mock_tests (student_id, label, taken_on, listening, reading, writing, speaking) values
  ('33333333-3333-3333-3333-000000000009', 'Mock #3 — Cambridge 18', '2026-04-11', 6, 6, 5.5, 5);
insert into public.mock_tests (student_id, label, taken_on, listening, reading, writing, speaking) values
  ('33333333-3333-3333-3333-000000000009', 'Mock #4 — Промежуточный', '2026-05-09', 6, 6.5, 5.5, 5.5);
insert into public.mock_tests (student_id, label, taken_on, listening, reading, writing, speaking) values
  ('33333333-3333-3333-3333-000000000009', 'Mock #5 — Cambridge 19', '2026-06-13', 6, 6.5, 5.5, 5.5);
insert into public.mock_tests (student_id, label, taken_on, listening, reading, writing, speaking) values
  ('33333333-3333-3333-3333-000000000009', 'Mock #6 — Полная симуляция', '2026-07-11', 6.5, 6.5, 6, 6);
insert into public.recommendations (student_id, skill, priority, title, detail) values
  ('33333333-3333-3333-3333-000000000009', 'speaking', 'high', 'Сократить слова-паузы', 'Долгие паузы перед ответами. Тренируйте старт ответа за 3 секунды: переформулируйте вопрос вслух, пока думаете.');
insert into public.recommendations (student_id, skill, priority, title, detail) values
  ('33333333-3333-3333-3333-000000000009', 'listening', 'medium', 'Задания на карты и планы', 'Путает лево/право под давлением. Делайте по 2 задания с картами в неделю с аудио на скорости 1.25x.');

-- Зере Амангельдина
insert into public.students (id, center_id, teacher_id, name, initials, student_group, target_band, exam_date, attendance, teacher_note) values
  ('33333333-3333-3333-3333-000000000010', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'Зере Амангельдина', 'ЗА', 'Advanced 34', 8, '2026-08-15', 97, 'До экзамена Зере две недели, тренд — 7.5. Финальный фокус: чёткость позиции в Writing Task 2 для рывка к 8.0.');
insert into public.mock_tests (student_id, label, taken_on, listening, reading, writing, speaking) values
  ('33333333-3333-3333-3333-000000000010', 'Mock #1 — Диагностика', '2026-02-14', 7, 7, 6, 6.5);
insert into public.mock_tests (student_id, label, taken_on, listening, reading, writing, speaking) values
  ('33333333-3333-3333-3333-000000000010', 'Mock #2 — Cambridge 17', '2026-03-14', 7.5, 7, 6.5, 7);
insert into public.mock_tests (student_id, label, taken_on, listening, reading, writing, speaking) values
  ('33333333-3333-3333-3333-000000000010', 'Mock #3 — Cambridge 18', '2026-04-11', 7.5, 7.5, 6.5, 7);
insert into public.mock_tests (student_id, label, taken_on, listening, reading, writing, speaking) values
  ('33333333-3333-3333-3333-000000000010', 'Mock #4 — Промежуточный', '2026-05-09', 8, 7.5, 6.5, 7.5);
insert into public.mock_tests (student_id, label, taken_on, listening, reading, writing, speaking) values
  ('33333333-3333-3333-3333-000000000010', 'Mock #5 — Cambridge 19', '2026-06-13', 8, 8, 7, 7.5);
insert into public.mock_tests (student_id, label, taken_on, listening, reading, writing, speaking) values
  ('33333333-3333-3333-3333-000000000010', 'Mock #6 — Полная симуляция', '2026-07-11', 8.5, 8, 7, 7.5);
insert into public.recommendations (student_id, skill, priority, title, detail) values
  ('33333333-3333-3333-3333-000000000010', 'writing', 'high', 'Позиция-тезис в Task 2', 'Позиция появляется только в заключении. Заявите чёткое мнение во вступлении и повторяйте его в каждом абзаце.');
insert into public.recommendations (student_id, skill, priority, title, detail) values
  ('33333333-3333-3333-3333-000000000010', 'speaking', 'low', 'Разнообразие интонации', 'Речь точная, но монотонная. Отмечайте ударные слова в тренировочных ответах и утрируйте их при записи и разборе.');

-- Санжар Оразбеков
insert into public.students (id, center_id, teacher_id, name, initials, student_group, target_band, exam_date, attendance, teacher_note) values
  ('33333333-3333-3333-3333-000000000011', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'Санжар Оразбеков', 'СО', 'Pre-Intermediate 12', 6.5, '2026-11-28', 91, 'Санжар присоединился в середине семестра и быстро догоняет. Грамматическая база крепкая; приоритет — расширение словарного запаса.');
insert into public.mock_tests (student_id, label, taken_on, listening, reading, writing, speaking) values
  ('33333333-3333-3333-3333-000000000011', 'Mock #1 — Диагностика', '2026-02-14', 5, 4.5, 4.5, 5);
insert into public.mock_tests (student_id, label, taken_on, listening, reading, writing, speaking) values
  ('33333333-3333-3333-3333-000000000011', 'Mock #2 — Cambridge 17', '2026-03-14', 5, 5, 5, 5);
insert into public.mock_tests (student_id, label, taken_on, listening, reading, writing, speaking) values
  ('33333333-3333-3333-3333-000000000011', 'Mock #3 — Cambridge 18', '2026-04-11', 5.5, 5, 5, 5.5);
insert into public.mock_tests (student_id, label, taken_on, listening, reading, writing, speaking) values
  ('33333333-3333-3333-3333-000000000011', 'Mock #4 — Промежуточный', '2026-05-09', 5.5, 5.5, 5, 5.5);
insert into public.mock_tests (student_id, label, taken_on, listening, reading, writing, speaking) values
  ('33333333-3333-3333-3333-000000000011', 'Mock #5 — Cambridge 19', '2026-06-13', 6, 5.5, 5.5, 6);
insert into public.mock_tests (student_id, label, taken_on, listening, reading, writing, speaking) values
  ('33333333-3333-3333-3333-000000000011', 'Mock #6 — Полная симуляция', '2026-07-11', 6, 6, 5.5, 6);
insert into public.recommendations (student_id, skill, priority, title, detail) values
  ('33333333-3333-3333-3333-000000000011', 'reading', 'high', 'Охват Academic Word List', 'Незнакомая лексика мешает пониманию. Прорабатывайте подсписки AWL 1–3 с интервальным повторением.');
insert into public.recommendations (student_id, skill, priority, title, detail) values
  ('33333333-3333-3333-3333-000000000011', 'writing', 'medium', 'Полнота ответа на задание', 'Часто отвечает лишь на половину вопросов из двух частей. Подчёркивайте обе части задания перед планированием.');

-- Камила Даулетова
insert into public.students (id, center_id, teacher_id, name, initials, student_group, target_band, exam_date, attendance, teacher_note) values
  ('33333333-3333-3333-3333-000000000012', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'Камила Даулетова', 'КД', 'IELTS 63 (Weekend)', 7.5, '2026-10-10', 95, 'Камила впечатляюще совмещает школьные олимпиады с подготовкой к IELTS. Reading уже на целевом уровне — держите и полируйте Writing.');
insert into public.mock_tests (student_id, label, taken_on, listening, reading, writing, speaking) values
  ('33333333-3333-3333-3333-000000000012', 'Mock #1 — Диагностика', '2026-02-14', 6, 6.5, 5.5, 6);
insert into public.mock_tests (student_id, label, taken_on, listening, reading, writing, speaking) values
  ('33333333-3333-3333-3333-000000000012', 'Mock #2 — Cambridge 17', '2026-03-14', 6.5, 7, 6, 6);
insert into public.mock_tests (student_id, label, taken_on, listening, reading, writing, speaking) values
  ('33333333-3333-3333-3333-000000000012', 'Mock #3 — Cambridge 18', '2026-04-11', 6.5, 7, 6, 6.5);
insert into public.mock_tests (student_id, label, taken_on, listening, reading, writing, speaking) values
  ('33333333-3333-3333-3333-000000000012', 'Mock #4 — Промежуточный', '2026-05-09', 7, 7.5, 6, 6.5);
insert into public.mock_tests (student_id, label, taken_on, listening, reading, writing, speaking) values
  ('33333333-3333-3333-3333-000000000012', 'Mock #5 — Cambridge 19', '2026-06-13', 7, 7.5, 6.5, 7);
insert into public.mock_tests (student_id, label, taken_on, listening, reading, writing, speaking) values
  ('33333333-3333-3333-3333-000000000012', 'Mock #6 — Полная симуляция', '2026-07-11', 7.5, 7.5, 6.5, 7);
insert into public.recommendations (student_id, skill, priority, title, detail) values
  ('33333333-3333-3333-3333-000000000012', 'writing', 'high', 'Связность без механических связок', 'Злоупотребляет «Firstly / Secondly / In conclusion». Разнообразьте отсылками («this trend», «such measures»).');
insert into public.recommendations (student_id, skill, priority, title, detail) values
  ('33333333-3333-3333-3333-000000000012', 'listening', 'low', 'Ловушки-дистракторы в multiple-choice', 'Следите за исправлениями по ходу аудио («actually, on second thought…») в Section 2.');


-- IELTS Pulse — Cambridge practice content (generated).
-- Original IELTS-style content, NOT the copyrighted Cambridge text.
-- Safe to re-run: tests upsert-by-id; passages/questions cascade.

delete from public.cambridge_tests where id in ('44444444-4444-4444-4444-000000000001', '44444444-4444-4444-4444-000000000002', '44444444-4444-4444-4444-000000000003', '44444444-4444-4444-4444-000000000004');

-- Academic Reading — Practice Set 1 (Cambridge-style, original)
insert into public.cambridge_tests (id, book_number, test_number, title, section_type) values
  ('44444444-4444-4444-4444-000000000001', 18, 1, 'Academic Reading — Practice Set 1 (Cambridge-style, original)', 'reading');
insert into public.test_passages (id, test_id, passage_number, title, text_content, audio_url) values
  ('55555555-5555-5555-5555-000000000001', '44444444-4444-4444-4444-000000000001', 1, 'The rise of urban beekeeping', 'A. Over the past two decades, the practice of keeping honeybees in cities has grown from a fringe hobby into a widespread urban movement. Rooftops, community gardens and even balconies now host hives that would once have been found only in the countryside. Supporters argue that urban beekeeping reconnects city dwellers with the natural world and draws attention to the wider decline of pollinating insects.

B. The appeal is easy to understand. A single hive can be managed in a small space, and cities often provide a surprisingly rich diet for bees. Parks, street trees and private gardens bloom at different times, so urban bees frequently enjoy a longer and more varied foraging season than their rural cousins, who may face vast fields of a single crop followed by months with little to eat.

C. Not everyone is convinced that the trend is beneficial. Dr Helena Voss, an ecologist, warns that placing too many managed hives in one area can leave little food for wild bees and other pollinators. Because honeybees are efficient foragers kept in large numbers, they may outcompete solitary species that are already under pressure. In her view, the enthusiasm for hives has outpaced the evidence that they help biodiversity.

D. Other researchers take a more measured position. Professor Adam Reilly accepts that competition is possible but argues that the true problem is a shortage of flowers, not a surplus of bees. If cities planted more diverse, nectar-rich vegetation, he suggests, both managed and wild pollinators could thrive together. His team has shown that neighbourhoods with abundant flowering plants support far larger insect populations regardless of how many hives are present.

E. What most experts agree on is the educational value of the movement. Even critics concede that a visible hive can transform how a community thinks about food, farming and the fragility of ecosystems. Schools that adopt hives report that pupils become noticeably more curious about where their food comes from and more willing to protect green spaces.', null);
insert into public.test_questions (id, passage_id, question_number, question_type, prompt, options, correct_answer, explanation) values
  ('66666666-6666-6666-6666-000000000001', '55555555-5555-5555-5555-000000000001', 1, 'true_false_not_given', 'Urban beekeeping was once mainly a rural activity.', '["TRUE","FALSE","NOT GIVEN"]'::jsonb, 'TRUE', 'Paragraph A says hives ''would once have been found only in the countryside''.');
insert into public.test_questions (id, passage_id, question_number, question_type, prompt, options, correct_answer, explanation) values
  ('66666666-6666-6666-6666-000000000002', '55555555-5555-5555-5555-000000000001', 2, 'true_false_not_given', 'City bees usually have a shorter foraging season than rural bees.', '["TRUE","FALSE","NOT GIVEN"]'::jsonb, 'FALSE', 'Paragraph B states urban bees often enjoy a ''longer and more varied foraging season''.');
insert into public.test_questions (id, passage_id, question_number, question_type, prompt, options, correct_answer, explanation) values
  ('66666666-6666-6666-6666-000000000003', '55555555-5555-5555-5555-000000000001', 3, 'true_false_not_given', 'Dr Voss has measured the exact number of wild bees lost to hives.', '["TRUE","FALSE","NOT GIVEN"]'::jsonb, 'NOT GIVEN', 'The passage reports her concern but gives no measurement of wild-bee losses.');
insert into public.test_questions (id, passage_id, question_number, question_type, prompt, options, correct_answer, explanation) values
  ('66666666-6666-6666-6666-000000000004', '55555555-5555-5555-5555-000000000001', 4, 'true_false_not_given', 'Schools with hives report increased pupil interest in food origins.', '["TRUE","FALSE","NOT GIVEN"]'::jsonb, 'TRUE', 'Paragraph E: pupils become ''more curious about where their food comes from''.');
insert into public.test_questions (id, passage_id, question_number, question_type, prompt, options, correct_answer, explanation) values
  ('66666666-6666-6666-6666-000000000005', '55555555-5555-5555-5555-000000000001', 5, 'mcq', 'According to Dr Voss, the main risk of many hives in one area is that', '["honeybees spread disease to wild bees","honeybees outcompete solitary species for food","hives are too expensive for cities to maintain","urban flowers are poisonous to bees"]'::jsonb, 'honeybees outcompete solitary species for food', 'Paragraph C: honeybees ''may outcompete solitary species that are already under pressure''.');
insert into public.test_questions (id, passage_id, question_number, question_type, prompt, options, correct_answer, explanation) values
  ('66666666-6666-6666-6666-000000000006', '55555555-5555-5555-5555-000000000001', 6, 'mcq', 'Professor Reilly believes the real problem is', '["a shortage of flowers","a surplus of hives","poor beekeeping skills","climate change"]'::jsonb, 'a shortage of flowers', 'Paragraph D: ''the true problem is a shortage of flowers, not a surplus of bees''.');
insert into public.test_questions (id, passage_id, question_number, question_type, prompt, options, correct_answer, explanation) values
  ('66666666-6666-6666-6666-000000000007', '55555555-5555-5555-5555-000000000001', 7, 'matching', 'Managed hives can crowd out wild pollinators when concentrated.', '["Dr Helena Voss","Professor Adam Reilly"]'::jsonb, 'Dr Helena Voss', 'This competition concern is attributed to Dr Voss in paragraph C.');
insert into public.test_questions (id, passage_id, question_number, question_type, prompt, options, correct_answer, explanation) values
  ('66666666-6666-6666-6666-000000000008', '55555555-5555-5555-5555-000000000001', 8, 'matching', 'Planting more varied vegetation lets managed and wild bees coexist.', '["Dr Helena Voss","Professor Adam Reilly"]'::jsonb, 'Professor Adam Reilly', 'Reilly''s position in paragraph D.');
insert into public.test_questions (id, passage_id, question_number, question_type, prompt, options, correct_answer, explanation) values
  ('66666666-6666-6666-6666-000000000009', '55555555-5555-5555-5555-000000000001', 9, 'matching', 'Enthusiasm for hives has moved ahead of the supporting evidence.', '["Dr Helena Voss","Professor Adam Reilly"]'::jsonb, 'Dr Helena Voss', 'Paragraph C: ''the enthusiasm for hives has outpaced the evidence''.');
insert into public.test_questions (id, passage_id, question_number, question_type, prompt, options, correct_answer, explanation) values
  ('66666666-6666-6666-6666-000000000010', '55555555-5555-5555-5555-000000000001', 10, 'fill_blanks', 'Complete the summary. A single hive needs only a small ________ to manage.', null, 'space', 'Paragraph B: ''can be managed in a small space''.');
insert into public.test_questions (id, passage_id, question_number, question_type, prompt, options, correct_answer, explanation) values
  ('66666666-6666-6666-6666-000000000011', '55555555-5555-5555-5555-000000000001', 11, 'fill_blanks', 'Reilly''s team found that areas with many flowering plants support larger ________ populations.', null, 'insect', 'Paragraph D: ''support far larger insect populations''.');
insert into public.test_questions (id, passage_id, question_number, question_type, prompt, options, correct_answer, explanation) values
  ('66666666-6666-6666-6666-000000000012', '55555555-5555-5555-5555-000000000001', 12, 'fill_blanks', 'Most experts agree the movement has strong ________ value for communities.', null, 'educational', 'Paragraph E: ''the educational value of the movement''.');

-- Listening — Practice Set 1 (Cambridge-style, original)
insert into public.cambridge_tests (id, book_number, test_number, title, section_type) values
  ('44444444-4444-4444-4444-000000000002', 18, 1, 'Listening — Practice Set 1 (Cambridge-style, original)', 'listening');
insert into public.test_passages (id, test_id, passage_number, title, text_content, audio_url) values
  ('55555555-5555-5555-5555-000000000002', '44444444-4444-4444-4444-000000000002', 1, 'Section 1 — Riverside Sports Centre membership', 'Заполните форму записи в спортивный центр. Прослушайте разговор администратора и клиента и впишите пропущенные слова или числа. Аудио демонстрационное.', null);
insert into public.test_questions (id, passage_id, question_number, question_type, prompt, options, correct_answer, explanation) values
  ('66666666-6666-6666-6666-000000000013', '55555555-5555-5555-5555-000000000002', 1, 'fill_blanks', 'Membership type: ________ (individual / family / student)', null, 'family', 'The caller signs up the whole household.');
insert into public.test_questions (id, passage_id, question_number, question_type, prompt, options, correct_answer, explanation) values
  ('66666666-6666-6666-6666-000000000014', '55555555-5555-5555-5555-000000000002', 2, 'fill_blanks', 'Start date: 1st ________', null, 'March|march', 'Membership begins on 1 March.');
insert into public.test_questions (id, passage_id, question_number, question_type, prompt, options, correct_answer, explanation) values
  ('66666666-6666-6666-6666-000000000015', '55555555-5555-5555-5555-000000000002', 3, 'fill_blanks', 'Monthly fee: £ ________', null, '45|45.00', 'The stated family rate is £45 per month.');
insert into public.test_questions (id, passage_id, question_number, question_type, prompt, options, correct_answer, explanation) values
  ('66666666-6666-6666-6666-000000000016', '55555555-5555-5555-5555-000000000002', 4, 'fill_blanks', 'Free induction session included: ________ (yes / no)', null, 'yes', 'A complimentary induction is offered.');
insert into public.test_questions (id, passage_id, question_number, question_type, prompt, options, correct_answer, explanation) values
  ('66666666-6666-6666-6666-000000000017', '55555555-5555-5555-5555-000000000002', 5, 'fill_blanks', 'Locker deposit required: £ ________', null, '10|10.00', 'A refundable £10 locker deposit is mentioned.');
insert into public.test_questions (id, passage_id, question_number, question_type, prompt, options, correct_answer, explanation) values
  ('66666666-6666-6666-6666-000000000018', '55555555-5555-5555-5555-000000000002', 6, 'mcq', 'Which facility is currently closed for repairs?', '["the swimming pool","the sauna","the tennis courts","the gym"]'::jsonb, 'the sauna', 'The sauna is temporarily unavailable.');
insert into public.test_questions (id, passage_id, question_number, question_type, prompt, options, correct_answer, explanation) values
  ('66666666-6666-6666-6666-000000000019', '55555555-5555-5555-5555-000000000002', 7, 'mcq', 'How can members book a class?', '["by phone only","through the mobile app","in person at reception","by email"]'::jsonb, 'through the mobile app', 'Class booking is done via the app.');
insert into public.test_questions (id, passage_id, question_number, question_type, prompt, options, correct_answer, explanation) values
  ('66666666-6666-6666-6666-000000000020', '55555555-5555-5555-5555-000000000002', 8, 'mcq', 'What must new members bring to their first visit?', '["a passport","photo ID and the confirmation email","cash for the full year","a doctor''s note"]'::jsonb, 'photo ID and the confirmation email', 'Reception asks for photo ID plus the confirmation email.');

-- Writing — Practice Set 1 (original)
insert into public.cambridge_tests (id, book_number, test_number, title, section_type) values
  ('44444444-4444-4444-4444-000000000003', 18, 1, 'Writing — Practice Set 1 (original)', 'writing');
insert into public.test_passages (id, test_id, passage_number, title, text_content, audio_url) values
  ('55555555-5555-5555-5555-000000000003', '44444444-4444-4444-4444-000000000003', 1, 'Task 1', 'The chart below shows the number of visitors to three city museums between 2010 and 2020. Summarise the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words.', null);
insert into public.test_passages (id, test_id, passage_number, title, text_content, audio_url) values
  ('55555555-5555-5555-5555-000000000004', '44444444-4444-4444-4444-000000000003', 2, 'Task 2', 'Some people believe that online learning will soon completely replace traditional classrooms. To what extent do you agree or disagree? Give reasons for your answer and include relevant examples. Write at least 250 words.', null);

-- Speaking — Practice Set 1 (original)
insert into public.cambridge_tests (id, book_number, test_number, title, section_type) values
  ('44444444-4444-4444-4444-000000000004', 18, 1, 'Speaking — Practice Set 1 (original)', 'speaking');
insert into public.test_passages (id, test_id, passage_number, title, text_content, audio_url) values
  ('55555555-5555-5555-5555-000000000005', '44444444-4444-4444-4444-000000000004', 1, 'Part 1 — Interview', 'Where do you live? · Do you prefer mornings or evenings? · How often do you read? · What kind of music do you enjoy?', null);
insert into public.test_passages (id, test_id, passage_number, title, text_content, audio_url) values
  ('55555555-5555-5555-5555-000000000006', '44444444-4444-4444-4444-000000000004', 2, 'Part 2 — Cue card', 'Describe a book that made an impression on you. You should say: what the book was; what it was about; when you read it; and explain why it stayed with you. You have 1 minute to prepare and up to 2 minutes to speak.', null);
insert into public.test_passages (id, test_id, passage_number, title, text_content, audio_url) values
  ('55555555-5555-5555-5555-000000000007', '44444444-4444-4444-4444-000000000004', 3, 'Part 3 — Discussion', 'Do you think people read less than they used to? · How might reading habits change in the future? · Should schools encourage reading for pleasure?', null);


-- EduFlow — groups seed (names + schedules). Safe to re-run.
insert into public.groups (name, schedule) values
  ('IELTS 62',            'Вт, Чт, Сб — 19:00'),
  ('IELTS 63 (Weekend)',  'Пн, Ср, Пт — 16:30'),
  ('Intermediate 45',     'Пн, Ср, Пт — 19:30'),
  ('Pre-Intermediate 12', 'Сб, Вс — 11:00'),
  ('Advanced 34',         'Вт, Чт — 19:00')
on conflict (name) do update set schedule = excluded.schedule;
