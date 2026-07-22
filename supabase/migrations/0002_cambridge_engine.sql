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
