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
  ('33333333-3333-3333-3333-000000000001', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'Арман Калибеков', 'АК', 'IELTS Интенсив — Утро', 7.5, '2026-09-19', 96, 'Арман показывает отличный прогресс в Listening. Нужно поработать над лексикой и связками в Writing Task 2.');
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
  ('33333333-3333-3333-3333-000000000002', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'Аружан Мукашева', 'АМ', 'IELTS Интенсив — Утро', 8, '2026-08-22', 100, 'Аружан — наш сильнейший читатель. Беглость речи отличная; отточите произношение сочетаний согласных для 8.0.');
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
  ('33333333-3333-3333-3333-000000000003', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'Диас Серикбай', 'ДС', 'IELTS Интенсив — Вечер', 7, '2026-10-03', 88, 'Диас поднял Listening на полбалла за семестр. Главный барьер — скорость чтения; нужна работа с секциями на время.');
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
  ('33333333-3333-3333-3333-000000000004', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'Айгерим Нурланова', 'АН', 'IELTS Базовый', 7, '2026-11-14', 92, 'Айгерим активно участвует, её словарный запас быстро растёт. Слабое место — Listening Section 4.');
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
  ('33333333-3333-3333-3333-000000000005', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'Алихан Тулегенов', 'АТ', 'IELTS Интенсив — Вечер', 7.5, '2026-09-05', 94, 'Речь Алихана почти как у носителя по беглости. Последний барьер к 7.5 — грамматическая точность в Writing под давлением времени.');
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
  ('33333333-3333-3333-3333-000000000006', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'Мадина Есенова', 'МЕ', 'IELTS Спринт (выходные)', 7, '2026-08-29', 85, 'Мадина заметно продвинулась за месяц после перехода на ежедневные упражнения по Listening. Держите темп в Writing Task 1.');
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
  ('33333333-3333-3333-3333-000000000007', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'Нурислам Бекжанов', 'НБ', 'IELTS Базовый', 6.5, '2026-12-05', 78, 'Посещаемость Нурислама снизилась в июне — отмечен для беседы с родителями. При регулярном посещении баллы держатся стабильно.');
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
  ('33333333-3333-3333-3333-000000000008', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'Томирис Айтбаева', 'ТА', 'IELTS Интенсив — Утро', 7, '2026-09-26', 98, 'Томирис исключительно стабильна — никогда не пропускает домашние задания. Готова выйти за рамки заученных структур в Speaking.');
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
  ('33333333-3333-3333-3333-000000000009', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'Бекарыс Жумагулов', 'БЖ', 'IELTS Спринт (выходные)', 6.5, '2026-10-17', 90, 'Бекарыс мыслит глубоко, но неуверен в Speaking. Упражнения на уверенность работают — беглость выросла на полбалла.');
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
  ('33333333-3333-3333-3333-000000000010', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'Зере Амангельдина', 'ЗА', 'IELTS Интенсив — Вечер', 8, '2026-08-15', 97, 'До экзамена Зере две недели, тренд — 7.5. Финальный фокус: чёткость позиции в Writing Task 2 для рывка к 8.0.');
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
  ('33333333-3333-3333-3333-000000000011', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'Санжар Оразбеков', 'СО', 'IELTS Базовый', 6.5, '2026-11-28', 91, 'Санжар присоединился в середине семестра и быстро догоняет. Грамматическая база крепкая; приоритет — расширение словарного запаса.');
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
  ('33333333-3333-3333-3333-000000000012', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'Камила Даулетова', 'КД', 'IELTS Спринт (выходные)', 7.5, '2026-10-10', 95, 'Камила впечатляюще совмещает школьные олимпиады с подготовкой к IELTS. Reading уже на целевом уровне — держите и полируйте Writing.');
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
