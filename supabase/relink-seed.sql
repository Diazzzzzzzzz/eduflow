-- EduFlow — re-link auth accounts to the demo cohort.
--
-- Runs LAST in setup.sql, and it has to: seed.sql delete-and-reinserts the
-- student rows, which nulls profiles.student_id (ON DELETE SET NULL) and
-- deletes guardianships (ON DELETE CASCADE). Without this step every
-- db:setup silently logs the student and parent out of their own data —
-- current_user_student_id() returns null and RLS then shows them nothing.
--
-- Matching is by the seeded account e-mails, so it is a no-op on a project
-- where those accounts do not exist.

-- Student account → their own student row (Арман, first seeded student).
update public.profiles p
   set student_id = '33333333-3333-3333-3333-000000000001'
  from auth.users u
 where u.id = p.id
   and u.email = 'student@eduflow.kz'
   and exists (
     select 1 from public.students s
      where s.id = '33333333-3333-3333-3333-000000000001'
   );

-- Parent account → guardianship over the same student.
insert into public.guardianships (parent_user_id, student_id)
select u.id, '33333333-3333-3333-3333-000000000001'
  from auth.users u
 where u.email = 'parent@eduflow.kz'
   and exists (
     select 1 from public.students s
      where s.id = '33333333-3333-3333-3333-000000000001'
   )
on conflict (parent_user_id, student_id) do nothing;
