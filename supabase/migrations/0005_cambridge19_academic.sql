-- IELTS Pulse — Cambridge IELTS 19 Academic dataset
-- Stores full tests (all four skills bundled per test), listening/reading
-- questions with answer keys, writing task prompts, and speaking prompts.
-- Idempotent + RLS-enabled. Distinct from the 0002 "cambridge_engine" schema,
-- which models one row per section; this dataset bundles all skills per test.
--
-- NOTE ON ANSWER KEYS: per the integration request, the read policies below
-- grant anon + authenticated SELECT on every table, including the
-- `correct_answers` column. That means the answer key is reachable by any
-- client using the anon key. If/when these tests are used for graded practice,
-- move `ielts_questions` behind the service role (as 0002 does) and score
-- server-side instead — see lib/services/ielts.ts.

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table if not exists public.ielts_tests (
  id          uuid primary key default gen_random_uuid(),
  book        text not null,
  test_number int  not null,
  created_at  timestamptz not null default now(),
  unique (book, test_number)
);

-- Listening + reading questions. Reading in this dataset is an answer key only
-- (no passages), so `prompt`/`label`/`part_number` are null for reading rows.
create table if not exists public.ielts_questions (
  id              uuid primary key default gen_random_uuid(),
  test_id         uuid not null references public.ielts_tests (id) on delete cascade,
  section         text not null check (section in ('listening', 'reading')),
  part_number     int,
  question_ref    text not null,
  sort_order      int  not null default 0,
  type            text check (type in (
                    'multiple_choice', 'multiple_choice_multiple', 'matching', 'matching_map'
                  )),
  prompt          text,
  label           text,
  correct_answers text[] not null,
  created_at      timestamptz not null default now(),
  unique (test_id, section, question_ref)
);

create table if not exists public.ielts_writing_tasks (
  id          uuid primary key default gen_random_uuid(),
  test_id     uuid not null references public.ielts_tests (id) on delete cascade,
  task_number int  not null,
  prompt      text not null,
  created_at  timestamptz not null default now(),
  unique (test_id, task_number)
);

create table if not exists public.ielts_speaking_prompts (
  id            uuid primary key default gen_random_uuid(),
  test_id       uuid not null references public.ielts_tests (id) on delete cascade,
  part_number   int  not null,
  category      text,          -- part 3 theme name; null for parts 1 & 2
  topic         text,          -- topic / cue card for parts 1 & 2
  prompt_points text[],        -- cue-card bullets (part 2)
  questions     text[],        -- discussion questions (parts 1 & 3)
  sort_order    int  not null default 0,
  created_at    timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------

create index if not exists ielts_questions_test_idx    on public.ielts_questions (test_id, section, sort_order);
create index if not exists ielts_writing_test_idx      on public.ielts_writing_tasks (test_id);
create index if not exists ielts_speaking_test_idx     on public.ielts_speaking_prompts (test_id, part_number, sort_order);

-- ---------------------------------------------------------------------------
-- Row Level Security — public/authenticated read access
-- ---------------------------------------------------------------------------

alter table public.ielts_tests            enable row level security;
alter table public.ielts_questions        enable row level security;
alter table public.ielts_writing_tasks    enable row level security;
alter table public.ielts_speaking_prompts enable row level security;

drop policy if exists "ielts_tests_read" on public.ielts_tests;
create policy "ielts_tests_read" on public.ielts_tests
  for select to anon, authenticated using (true);

drop policy if exists "ielts_questions_read" on public.ielts_questions;
create policy "ielts_questions_read" on public.ielts_questions
  for select to anon, authenticated using (true);

drop policy if exists "ielts_writing_read" on public.ielts_writing_tasks;
create policy "ielts_writing_read" on public.ielts_writing_tasks
  for select to anon, authenticated using (true);

drop policy if exists "ielts_speaking_read" on public.ielts_speaking_prompts;
create policy "ielts_speaking_read" on public.ielts_speaking_prompts
  for select to anon, authenticated using (true);

-- Writes are intentionally not granted to anon/authenticated: content is
-- loaded by the seed script through the service-role key, which bypasses RLS.
