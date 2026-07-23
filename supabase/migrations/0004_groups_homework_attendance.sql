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
