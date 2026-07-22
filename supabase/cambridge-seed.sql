-- IELTS Pulse — Cambridge practice content (generated).
-- Original IELTS-style content, NOT the copyrighted Cambridge text.
-- Safe to re-run: tests upsert-by-id; passages/questions cascade.

delete from public.cambridge_tests where id in ('44444444-4444-4444-4444-000000000001', '44444444-4444-4444-4444-000000000002', '44444444-4444-4444-4444-000000000003', '44444444-4444-4444-4444-000000000004');

-- Academic Reading — Practice Set 1 (Cambridge-style, original)
insert into public.cambridge_tests (id, book_number, test_number, title, section_type) values
  ('44444444-4444-4444-4444-000000000001', 18, 1, 'Academic Reading — Practice Set 1 (Cambridge-style, original)', 'reading');
insert into public.test_passages (id, test_id, passage_number, title, text_content, audio_url) values
  ('55555555-5555-5555-5555-000000000001', '44444444-4444-4444-4444-000000000001', 1, 'The rise of urban beekeeping', 'A. Over the past two decades, the practice of keeping honeybees in cities has grown from a fringe hobby into a widespread urban movement. Rooftops, community gardens and even balconies now host hives that would once have been found only in the countryside. Supporters argue that urban beekeeping reconnects city dwellers with the natural world and draws attention to the wider decline of pollinating insects.

B. The appeal is easy to understand. A single hive can be managed in a small space, and cities often provide a surprisingly rich diet for bees. Parks, street trees and private gardens bloom at different times, so urban bees frequently enjoy a longer and more varied foraging season than their rural cousins, who may face vast fields of a single crop followed by months with little to eat.

C. Not everyone is convinced that the trend is beneficial. Dr Helena Voss, an ecologist, warns that placing too many managed hives in one area can leave little food for wild bees and other pollinators. Because honeybees are efficient foragers kept in large numbers, they may outcompete solitary species that are already under pressure. In her view, the enthusiasm for hives has outpaced the evidence that they help biodiversity.

D. Other researchers take a more measured position. Professor Adam Reilly accepts that competition is possible but argues that the true problem is a shortage of flowers, not a surplus of bees. If cities planted more diverse, nectar-rich vegetation, he suggests, both managed and wild pollinators could thrive together. His team has shown that neighbourhoods with abundant flowering plants support far larger insect populations regardless of how many hives are present.

E. What most experts agree on is the educational value of the movement. Even critics concede that a visible hive can transform how a community thinks about food, farming and the fragility of ecosystems. Schools that adopt hives report that pupils become noticeably more curious about where their food comes from and more willing to protect green spaces.', null);
insert into public.test_questions (id, passage_id, question_number, question_type, prompt, options, correct_answer, explanation) values
  ('66666666-6666-6666-6666-000000000001', '55555555-5555-5555-5555-000000000001', 1, 'true_false_not_given', 'Urban beekeeping was once mainly a rural activity.', '["TRUE","FALSE","NOT GIVEN"]'::jsonb, 'TRUE', 'Paragraph A says hives ''would once have been found only in the countryside''.');
insert into public.test_questions (id, passage_id, question_number, question_type, prompt, options, correct_answer, explanation) values
  ('66666666-6666-6666-6666-000000000002', '55555555-5555-5555-5555-000000000001', 2, 'true_false_not_given', 'City bees usually have a shorter foraging season than rural bees.', '["TRUE","FALSE","NOT GIVEN"]'::jsonb, 'FALSE', 'Paragraph B states urban bees often enjoy a ''longer and more varied foraging season''.');
insert into public.test_questions (id, passage_id, question_number, question_type, prompt, options, correct_answer, explanation) values
  ('66666666-6666-6666-6666-000000000003', '55555555-5555-5555-5555-000000000001', 3, 'true_false_not_given', 'Dr Voss has measured the exact number of wild bees lost to hives.', '["TRUE","FALSE","NOT GIVEN"]'::jsonb, 'NOT GIVEN', 'The passage reports her concern but gives no measurement of wild-bee losses.');
insert into public.test_questions (id, passage_id, question_number, question_type, prompt, options, correct_answer, explanation) values
  ('66666666-6666-6666-6666-000000000004', '55555555-5555-5555-5555-000000000001', 4, 'true_false_not_given', 'Schools with hives report increased pupil interest in food origins.', '["TRUE","FALSE","NOT GIVEN"]'::jsonb, 'TRUE', 'Paragraph E: pupils become ''more curious about where their food comes from''.');
insert into public.test_questions (id, passage_id, question_number, question_type, prompt, options, correct_answer, explanation) values
  ('66666666-6666-6666-6666-000000000005', '55555555-5555-5555-5555-000000000001', 5, 'mcq', 'According to Dr Voss, the main risk of many hives in one area is that', '["honeybees spread disease to wild bees","honeybees outcompete solitary species for food","hives are too expensive for cities to maintain","urban flowers are poisonous to bees"]'::jsonb, 'honeybees outcompete solitary species for food', 'Paragraph C: honeybees ''may outcompete solitary species that are already under pressure''.');
insert into public.test_questions (id, passage_id, question_number, question_type, prompt, options, correct_answer, explanation) values
  ('66666666-6666-6666-6666-000000000006', '55555555-5555-5555-5555-000000000001', 6, 'mcq', 'Professor Reilly believes the real problem is', '["a shortage of flowers","a surplus of hives","poor beekeeping skills","climate change"]'::jsonb, 'a shortage of flowers', 'Paragraph D: ''the true problem is a shortage of flowers, not a surplus of bees''.');
insert into public.test_questions (id, passage_id, question_number, question_type, prompt, options, correct_answer, explanation) values
  ('66666666-6666-6666-6666-000000000007', '55555555-5555-5555-5555-000000000001', 7, 'matching', 'Managed hives can crowd out wild pollinators when concentrated.', '["Dr Helena Voss","Professor Adam Reilly"]'::jsonb, 'Dr Helena Voss', 'This competition concern is attributed to Dr Voss in paragraph C.');
insert into public.test_questions (id, passage_id, question_number, question_type, prompt, options, correct_answer, explanation) values
  ('66666666-6666-6666-6666-000000000008', '55555555-5555-5555-5555-000000000001', 8, 'matching', 'Planting more varied vegetation lets managed and wild bees coexist.', '["Dr Helena Voss","Professor Adam Reilly"]'::jsonb, 'Professor Adam Reilly', 'Reilly''s position in paragraph D.');
insert into public.test_questions (id, passage_id, question_number, question_type, prompt, options, correct_answer, explanation) values
  ('66666666-6666-6666-6666-000000000009', '55555555-5555-5555-5555-000000000001', 9, 'matching', 'Enthusiasm for hives has moved ahead of the supporting evidence.', '["Dr Helena Voss","Professor Adam Reilly"]'::jsonb, 'Dr Helena Voss', 'Paragraph C: ''the enthusiasm for hives has outpaced the evidence''.');
insert into public.test_questions (id, passage_id, question_number, question_type, prompt, options, correct_answer, explanation) values
  ('66666666-6666-6666-6666-000000000010', '55555555-5555-5555-5555-000000000001', 10, 'fill_blanks', 'Complete the summary. A single hive needs only a small ________ to manage.', null, 'space', 'Paragraph B: ''can be managed in a small space''.');
insert into public.test_questions (id, passage_id, question_number, question_type, prompt, options, correct_answer, explanation) values
  ('66666666-6666-6666-6666-000000000011', '55555555-5555-5555-5555-000000000001', 11, 'fill_blanks', 'Reilly''s team found that areas with many flowering plants support larger ________ populations.', null, 'insect', 'Paragraph D: ''support far larger insect populations''.');
insert into public.test_questions (id, passage_id, question_number, question_type, prompt, options, correct_answer, explanation) values
  ('66666666-6666-6666-6666-000000000012', '55555555-5555-5555-5555-000000000001', 12, 'fill_blanks', 'Most experts agree the movement has strong ________ value for communities.', null, 'educational', 'Paragraph E: ''the educational value of the movement''.');

-- Listening — Practice Set 1 (Cambridge-style, original)
insert into public.cambridge_tests (id, book_number, test_number, title, section_type) values
  ('44444444-4444-4444-4444-000000000002', 18, 1, 'Listening — Practice Set 1 (Cambridge-style, original)', 'listening');
insert into public.test_passages (id, test_id, passage_number, title, text_content, audio_url) values
  ('55555555-5555-5555-5555-000000000002', '44444444-4444-4444-4444-000000000002', 1, 'Section 1 — Riverside Sports Centre membership', 'Заполните форму записи в спортивный центр. Прослушайте разговор администратора и клиента и впишите пропущенные слова или числа. Аудио демонстрационное.', null);
insert into public.test_questions (id, passage_id, question_number, question_type, prompt, options, correct_answer, explanation) values
  ('66666666-6666-6666-6666-000000000013', '55555555-5555-5555-5555-000000000002', 1, 'fill_blanks', 'Membership type: ________ (individual / family / student)', null, 'family', 'The caller signs up the whole household.');
insert into public.test_questions (id, passage_id, question_number, question_type, prompt, options, correct_answer, explanation) values
  ('66666666-6666-6666-6666-000000000014', '55555555-5555-5555-5555-000000000002', 2, 'fill_blanks', 'Start date: 1st ________', null, 'March|march', 'Membership begins on 1 March.');
insert into public.test_questions (id, passage_id, question_number, question_type, prompt, options, correct_answer, explanation) values
  ('66666666-6666-6666-6666-000000000015', '55555555-5555-5555-5555-000000000002', 3, 'fill_blanks', 'Monthly fee: £ ________', null, '45|45.00', 'The stated family rate is £45 per month.');
insert into public.test_questions (id, passage_id, question_number, question_type, prompt, options, correct_answer, explanation) values
  ('66666666-6666-6666-6666-000000000016', '55555555-5555-5555-5555-000000000002', 4, 'fill_blanks', 'Free induction session included: ________ (yes / no)', null, 'yes', 'A complimentary induction is offered.');
insert into public.test_questions (id, passage_id, question_number, question_type, prompt, options, correct_answer, explanation) values
  ('66666666-6666-6666-6666-000000000017', '55555555-5555-5555-5555-000000000002', 5, 'fill_blanks', 'Locker deposit required: £ ________', null, '10|10.00', 'A refundable £10 locker deposit is mentioned.');
insert into public.test_questions (id, passage_id, question_number, question_type, prompt, options, correct_answer, explanation) values
  ('66666666-6666-6666-6666-000000000018', '55555555-5555-5555-5555-000000000002', 6, 'mcq', 'Which facility is currently closed for repairs?', '["the swimming pool","the sauna","the tennis courts","the gym"]'::jsonb, 'the sauna', 'The sauna is temporarily unavailable.');
insert into public.test_questions (id, passage_id, question_number, question_type, prompt, options, correct_answer, explanation) values
  ('66666666-6666-6666-6666-000000000019', '55555555-5555-5555-5555-000000000002', 7, 'mcq', 'How can members book a class?', '["by phone only","through the mobile app","in person at reception","by email"]'::jsonb, 'through the mobile app', 'Class booking is done via the app.');
insert into public.test_questions (id, passage_id, question_number, question_type, prompt, options, correct_answer, explanation) values
  ('66666666-6666-6666-6666-000000000020', '55555555-5555-5555-5555-000000000002', 8, 'mcq', 'What must new members bring to their first visit?', '["a passport","photo ID and the confirmation email","cash for the full year","a doctor''s note"]'::jsonb, 'photo ID and the confirmation email', 'Reception asks for photo ID plus the confirmation email.');

-- Writing — Practice Set 1 (original)
insert into public.cambridge_tests (id, book_number, test_number, title, section_type) values
  ('44444444-4444-4444-4444-000000000003', 18, 1, 'Writing — Practice Set 1 (original)', 'writing');
insert into public.test_passages (id, test_id, passage_number, title, text_content, audio_url) values
  ('55555555-5555-5555-5555-000000000003', '44444444-4444-4444-4444-000000000003', 1, 'Task 1', 'The chart below shows the number of visitors to three city museums between 2010 and 2020. Summarise the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words.', null);
insert into public.test_passages (id, test_id, passage_number, title, text_content, audio_url) values
  ('55555555-5555-5555-5555-000000000004', '44444444-4444-4444-4444-000000000003', 2, 'Task 2', 'Some people believe that online learning will soon completely replace traditional classrooms. To what extent do you agree or disagree? Give reasons for your answer and include relevant examples. Write at least 250 words.', null);

-- Speaking — Practice Set 1 (original)
insert into public.cambridge_tests (id, book_number, test_number, title, section_type) values
  ('44444444-4444-4444-4444-000000000004', 18, 1, 'Speaking — Practice Set 1 (original)', 'speaking');
insert into public.test_passages (id, test_id, passage_number, title, text_content, audio_url) values
  ('55555555-5555-5555-5555-000000000005', '44444444-4444-4444-4444-000000000004', 1, 'Part 1 — Interview', 'Where do you live? · Do you prefer mornings or evenings? · How often do you read? · What kind of music do you enjoy?', null);
insert into public.test_passages (id, test_id, passage_number, title, text_content, audio_url) values
  ('55555555-5555-5555-5555-000000000006', '44444444-4444-4444-4444-000000000004', 2, 'Part 2 — Cue card', 'Describe a book that made an impression on you. You should say: what the book was; what it was about; when you read it; and explain why it stayed with you. You have 1 minute to prepare and up to 2 minutes to speak.', null);
insert into public.test_passages (id, test_id, passage_number, title, text_content, audio_url) values
  ('55555555-5555-5555-5555-000000000007', '44444444-4444-4444-4444-000000000004', 3, 'Part 3 — Discussion', 'Do you think people read less than they used to? · How might reading habits change in the future? · Should schools encourage reading for pleasure?', null);
