-- EduFlow — groups seed (names + schedules). Safe to re-run.
insert into public.groups (name, schedule) values
  ('IELTS 62',            'Вт, Чт, Сб — 19:00'),
  ('IELTS 63 (Weekend)',  'Пн, Ср, Пт — 16:30'),
  ('Intermediate 45',     'Пн, Ср, Пт — 19:30'),
  ('Pre-Intermediate 12', 'Сб, Вс — 11:00'),
  ('Advanced 34',         'Вт, Чт — 19:00')
on conflict (name) do update set schedule = excluded.schedule;
