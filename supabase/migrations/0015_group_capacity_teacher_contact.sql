-- EduFlow — Stage 5: give the director dashboard real columns to report.
--
-- Two figures on that screen were manufactured rather than stored:
--   * group capacity was Math.max(headcount, ceil(headcount/4)*4) — a formula
--     derived from the headcount itself, so every group always looked nearly
--     full and "6/8" could never mean anything;
--   * the staff roster's email came from a hardcoded list in lib/admin-data,
--     because public.teachers had nowhere to keep one.

alter table public.groups
  add column if not exists capacity int check (capacity is null or capacity between 1 and 100);

alter table public.teachers
  add column if not exists email text;

comment on column public.groups.capacity is
  'Nominal seats for the group. NULL means "not set" — the dashboard shows the headcount alone rather than inventing a denominator.';

-- Seed a plausible starting capacity for existing groups: the current
-- headcount rounded up to the next multiple of four, floored at four. This is
-- the same shape the old formula produced, but it is now a stored value a
-- director can correct — not a number recomputed from the roster every render.
update public.groups g
   set capacity = greatest(4, ceil(coalesce(c.n, 0) / 4.0) * 4)
  from (
    select group_id, count(*)::int as n
      from public.enrollments
     where status = 'active'
     group by group_id
  ) c
 where c.group_id = g.id
   and g.capacity is null;

-- Groups with nobody enrolled still need a sane default.
update public.groups set capacity = 8 where capacity is null;
