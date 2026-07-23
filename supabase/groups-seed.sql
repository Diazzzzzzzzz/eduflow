-- EduFlow — groups seed (names + schedules). Safe to re-run.
insert into public.groups (name, schedule) values
  ('IELTS 62',            'Пн-Ср-Пт 18:00'),
  ('IELTS 63 (Weekend)',  'Сб-Вс 10:00'),
  ('Intermediate 45',     'Пн-Ср-Пт 19:30'),
  ('Pre-Intermediate 12', 'Вт-Чт 17:00'),
  ('Advanced 34',         'Вт-Чт 19:00')
on conflict (name) do update set schedule = excluded.schedule;
