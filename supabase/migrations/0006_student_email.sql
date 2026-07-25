-- Contact address for a student, used to invite them to the portal.
-- Nullable: the existing demo cohort has no addresses on file.
alter table public.students
  add column if not exists email text;

-- One address per student within a center; nulls are unaffected.
create unique index if not exists students_center_email_key
  on public.students (center_id, lower(email))
  where email is not null;
