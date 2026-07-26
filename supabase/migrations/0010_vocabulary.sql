-- EduFlow — personal vocabulary.
--
-- Every row belongs to one student, including words a teacher assigns: the
-- learning status is the learner's, so two students working the same topic
-- keep independent progress on the same word.

create table if not exists public.vocabulary_entries (
  id          uuid primary key default gen_random_uuid(),
  center_id   uuid not null references public.language_centers (id) on delete cascade,
  student_id  uuid not null references public.students (id) on delete cascade,
  term        text not null,
  phonetic    text,
  translation text not null,
  -- The sentence the word was taken from, or a model sentence.
  example     text,
  source      text not null default 'student'
                check (source in ('student', 'teacher')),
  topic       text,
  status      text not null default 'new'
                check (status in ('new', 'learning', 'mastered')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  -- One entry per word per student; re-saving updates instead of duplicating.
  unique (student_id, term)
);

create index if not exists vocabulary_student_status_idx
  on public.vocabulary_entries (student_id, status);

alter table public.vocabulary_entries enable row level security;

drop policy if exists "vocabulary_rw_center" on public.vocabulary_entries;
create policy "vocabulary_rw_center" on public.vocabulary_entries
  for all
  using (center_id in (select public.current_user_center_ids()))
  with check (center_id in (select public.current_user_center_ids()));
