/**
 * Generates supabase/cambridge-seed.sql from lib/cambridge-sample.ts so the
 * seeded Cambridge tests match the offline fallback exactly. Run:
 *
 *   npx tsx scripts/gen-cambridge-seed.ts > supabase/cambridge-seed.sql
 *
 * Fixed UUIDs make it idempotent (tests are deleted then re-inserted; passages
 * and questions cascade).
 */
import { CAMBRIDGE_SAMPLE } from "../lib/cambridge-sample";

const q = (s: string) => `'${s.replace(/'/g, "''")}'`;
const jsonb = (v: unknown) =>
  v == null ? "null" : `'${JSON.stringify(v).replace(/'/g, "''")}'::jsonb`;

const testUuid = (i: number) =>
  `44444444-4444-4444-4444-${String(i + 1).padStart(12, "0")}`;
let pCounter = 0;
let qCounter = 0;
const passageUuid = () =>
  `55555555-5555-5555-5555-${String(++pCounter).padStart(12, "0")}`;
const questionUuid = () =>
  `66666666-6666-6666-6666-${String(++qCounter).padStart(12, "0")}`;

const lines: string[] = [];
lines.push("-- IELTS Pulse — Cambridge practice content (generated).");
lines.push("-- Original IELTS-style content, NOT the copyrighted Cambridge text.");
lines.push("-- Safe to re-run: tests upsert-by-id; passages/questions cascade.");
lines.push("");

const testIds = CAMBRIDGE_SAMPLE.map((_, i) => q(testUuid(i))).join(", ");
lines.push(`delete from public.cambridge_tests where id in (${testIds});`);
lines.push("");

CAMBRIDGE_SAMPLE.forEach((t, i) => {
  const tid = testUuid(i);
  lines.push(`-- ${t.title}`);
  lines.push(
    `insert into public.cambridge_tests (id, book_number, test_number, title, section_type) values\n  (${q(
      tid
    )}, ${t.bookNumber}, ${t.testNumber}, ${q(t.title)}, ${q(t.sectionType)});`
  );

  t.passages.forEach((p) => {
    const pid = passageUuid();
    lines.push(
      `insert into public.test_passages (id, test_id, passage_number, title, text_content, audio_url) values\n  (${q(
        pid
      )}, ${q(tid)}, ${p.passageNumber}, ${q(p.title)}, ${q(p.textContent)}, ${
        p.audioUrl ? q(p.audioUrl) : "null"
      });`
    );

    p.questions.forEach((qu) => {
      lines.push(
        `insert into public.test_questions (id, passage_id, question_number, question_type, prompt, options, correct_answer, explanation) values\n  (${q(
          questionUuid()
        )}, ${q(pid)}, ${qu.questionNumber}, ${q(qu.type)}, ${q(qu.prompt)}, ${jsonb(
          qu.options
        )}, ${q(qu.correctAnswer)}, ${qu.explanation ? q(qu.explanation) : "null"});`
      );
    });
  });

  lines.push("");
});

process.stdout.write(lines.join("\n"));
