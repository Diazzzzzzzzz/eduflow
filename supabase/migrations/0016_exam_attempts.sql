-- ---------------------------------------------------------------------------
-- 0016 — exam_attempts: results from the lib/exam test runner.
--
-- Why a new table rather than student_submissions: that table's test_id is a
-- FK to cambridge_tests, and the exam engine identifies a paper by slug
-- ("ielts-reading-practice-01") — bundled papers have no row anywhere. The
-- result was that saveSubmission() silently dropped every attempt, so students
-- were scored on screen and nothing was ever recorded. The Cambridge engine
-- those tables belonged to has since been removed.
--
-- Paper title and skill are denormalised on purpose: an attempt is a historical
-- fact and must stay readable after a paper is re-imported, renamed or removed.
-- Idempotent.
-- ---------------------------------------------------------------------------

create table if not exists public.exam_attempts (
  id               uuid primary key default gen_random_uuid(),
  student_id       uuid not null references public.students (id) on delete cascade,
  -- Slug of the paper, not a FK: bundled papers exist only in code.
  paper_slug       text not null,
  paper_title      text not null,
  skill            text not null check (skill in ('reading', 'listening')),
  correct          integer not null check (correct >= 0),
  total            integer not null check (total > 0),
  band             numeric(2, 1),
  answers          jsonb not null default '{}'::jsonb,
  duration_seconds integer check (duration_seconds is null or duration_seconds >= 0),
  completed_at     timestamptz not null default now(),
  created_at       timestamptz not null default now()
);

create index if not exists exam_attempts_student_idx
  on public.exam_attempts (student_id, completed_at desc);
create index if not exists exam_attempts_paper_idx
  on public.exam_attempts (paper_slug);

alter table public.exam_attempts enable row level security;

-- A student reads their own attempts; a parent reads their wards'; staff read
-- their centre's. Writes go through the service role in the submit route, so
-- no insert policy is granted here — a client cannot invent a band for itself.
drop policy if exists "exam_attempts_self_select" on public.exam_attempts;
create policy "exam_attempts_self_select" on public.exam_attempts
  for select using (student_id = public.current_user_student_id());

drop policy if exists "exam_attempts_parent_select" on public.exam_attempts;
create policy "exam_attempts_parent_select" on public.exam_attempts
  for select using (student_id in (select public.current_user_ward_ids()));

drop policy if exists "exam_attempts_staff_select" on public.exam_attempts;
create policy "exam_attempts_staff_select" on public.exam_attempts
  for select using (
    student_id in (
      select id from public.students
      where center_id in (select public.current_user_center_ids())
    )
  );
