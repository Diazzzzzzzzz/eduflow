-- EduFlow — imported exam papers.
--
-- The paper is stored as one JSONB document rather than normalised into
-- passages/groups/questions tables: the engine already consumes a single
-- nested `ExamSectionFull`, nothing queries inside it, and keeping it whole
-- means an import round-trips byte-for-byte.
--
-- Answer keys live inside `payload`. Reads go through the service-role client
-- on the server, and the API strips keys before anything reaches a browser.

create table if not exists public.exam_papers (
  id            uuid primary key default gen_random_uuid(),
  center_id     uuid not null references public.language_centers (id) on delete cascade,
  -- Stable identifier used in URLs and by the engine (`ExamSection.id`).
  slug          text not null,
  title         text not null,
  skill         text not null check (skill in ('reading', 'listening')),
  duration_minutes int not null default 60 check (duration_minutes between 1 and 240),
  attribution   text,
  -- Denormalised counters so the catalogue lists papers without parsing JSON.
  passage_count int not null default 0,
  question_count int not null default 0,
  payload       jsonb not null,
  published     boolean not null default true,
  imported_by   text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (center_id, slug)
);

create index if not exists exam_papers_center_skill_idx
  on public.exam_papers (center_id, skill, published);

alter table public.exam_papers enable row level security;

drop policy if exists "exam_papers_rw_center" on public.exam_papers;
create policy "exam_papers_rw_center" on public.exam_papers
  for all
  using (center_id in (select public.current_user_center_ids()))
  with check (center_id in (select public.current_user_center_ids()));
