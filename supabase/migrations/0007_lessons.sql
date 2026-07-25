-- EduFlow — course syllabus.
--
-- `lessons` holds the fixed programme for a centre; a group's position in it is
-- a single pointer on `groups`, so a group can never have two current lessons.

alter table public.groups
  add column if not exists current_lesson int not null default 1;

-- `add constraint if not exists` doesn't exist in Postgres, so guard on catalog.
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'groups_current_lesson_positive'
  ) then
    alter table public.groups
      add constraint groups_current_lesson_positive check (current_lesson >= 1);
  end if;
end $$;

create table if not exists public.lessons (
  id             uuid primary key default gen_random_uuid(),
  center_id      uuid not null references public.language_centers (id) on delete cascade,
  number         int not null check (number >= 1),
  title          text not null,
  summary        text,
  skill          text not null default 'general'
                   check (skill in ('listening', 'reading', 'writing', 'speaking', 'general')),
  material_title text,
  material_url   text,
  created_at     timestamptz not null default now(),
  unique (center_id, number)
);

create index if not exists lessons_center_number_idx
  on public.lessons (center_id, number);

alter table public.lessons enable row level security;

-- Syllabus is readable by anyone in the centre and writable by its teachers.
drop policy if exists "lessons_rw_center" on public.lessons;
create policy "lessons_rw_center" on public.lessons
  for all
  using (center_id in (select public.current_user_center_ids()))
  with check (center_id in (select public.current_user_center_ids()));
