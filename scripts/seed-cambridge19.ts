/**
 * Seeds the Cambridge IELTS 19 Academic dataset into Supabase.
 *
 * Reads cambridge_19_academic.json and inserts it into the tables created by
 * supabase/migrations/0005_cambridge19_academic.sql. Uses the service-role key
 * (bypasses RLS). Idempotent: every test in the file is deleted and re-inserted
 * so re-running produces the same rows (children cascade).
 *
 * Prereqs: apply migration 0005 first (e.g. via `npm run db:setup` or the
 * Supabase SQL editor).
 *
 * Usage:
 *   npm run seed:cambridge19
 *   # equivalently: tsx --env-file=.env.local scripts/seed-cambridge19.ts
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in the env.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";
import type {
  IeltsBook,
  IeltsTest,
  ListeningPart,
  ListeningSection,
} from "../lib/types/ielts";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error(
    "✗ Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY " +
      "(e.g. run via `npm run seed:cambridge19`, which loads .env.local)."
  );
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const dataPath = fileURLToPath(
  new URL("../cambridge_19_academic.json", import.meta.url)
);
const book: IeltsBook = JSON.parse(readFileSync(dataPath, "utf8"));

/** First integer in an id/ref, used for stable ordering ("21-22" → 21). */
const orderOf = (ref: string | number): number =>
  parseInt(String(ref), 10) || 0;

/** Normalize a question's correct answer(s) to a non-empty string array. */
const answersOf = (q: {
  answer?: string;
  answers?: string[];
}): string[] => {
  if (Array.isArray(q.answers)) return q.answers;
  if (q.answer != null) return [String(q.answer)];
  return [];
};

type QuestionInsert = {
  test_id: string;
  section: "listening" | "reading";
  part_number: number | null;
  question_ref: string;
  sort_order: number;
  type: string | null;
  prompt: string | null;
  label: string | null;
  correct_answers: string[];
};

function listeningRows(testId: string, listening: ListeningSection): QuestionInsert[] {
  const rows: QuestionInsert[] = [];
  const parts: [number, ListeningPart][] = [
    [1, listening.part_1],
    [2, listening.part_2],
    [3, listening.part_3],
    [4, listening.part_4],
  ];
  for (const [partNumber, part] of parts) {
    for (const q of part.questions) {
      rows.push({
        test_id: testId,
        section: "listening",
        part_number: partNumber,
        question_ref: String(q.id),
        sort_order: orderOf(q.id),
        type: q.type ?? null,
        prompt: q.prompt ?? null,
        label: q.label ?? null,
        correct_answers: answersOf(q),
      });
    }
  }
  return rows;
}

function readingRows(testId: string, answers: Record<string, string | string[]>): QuestionInsert[] {
  return Object.entries(answers).map(([ref, value]) => ({
    test_id: testId,
    section: "reading",
    part_number: null,
    question_ref: ref,
    sort_order: orderOf(ref),
    type: null,
    prompt: null,
    label: null,
    correct_answers: Array.isArray(value) ? value : [String(value)],
  }));
}

async function seedTest(test: IeltsTest): Promise<void> {
  // Idempotency: remove any prior copy of this (book, test_number). Children
  // cascade via the FK, so questions/writing/speaking go with it.
  await supabase
    .from("ielts_tests")
    .delete()
    .eq("book", book.book)
    .eq("test_number", test.test_id);

  const { data: inserted, error: testErr } = await supabase
    .from("ielts_tests")
    .insert({ book: book.book, test_number: test.test_id })
    .select("id")
    .single();
  if (testErr || !inserted) {
    throw new Error(`insert ielts_tests (test ${test.test_id}): ${testErr?.message}`);
  }
  const testId = inserted.id as string;

  // Listening + reading questions.
  const questions = [
    ...listeningRows(testId, test.listening),
    ...readingRows(testId, test.reading.answers),
  ];
  const { error: qErr } = await supabase.from("ielts_questions").insert(questions);
  if (qErr) throw new Error(`insert ielts_questions (test ${test.test_id}): ${qErr.message}`);

  // Writing tasks.
  const { error: wErr } = await supabase.from("ielts_writing_tasks").insert([
    { test_id: testId, task_number: 1, prompt: test.writing.task_1 },
    { test_id: testId, task_number: 2, prompt: test.writing.task_2 },
  ]);
  if (wErr) throw new Error(`insert ielts_writing_tasks (test ${test.test_id}): ${wErr.message}`);

  // Speaking prompts.
  const speaking = [
    {
      test_id: testId,
      part_number: 1,
      category: null as string | null,
      topic: test.speaking.part_1.topic,
      prompt_points: null as string[] | null,
      questions: test.speaking.part_1.questions,
      sort_order: 0,
    },
    {
      test_id: testId,
      part_number: 2,
      category: null as string | null,
      topic: test.speaking.part_2.topic,
      prompt_points: test.speaking.part_2.prompt_points,
      questions: null as string[] | null,
      sort_order: 0,
    },
    ...Object.entries(test.speaking.part_3).map(([category, qs], i) => ({
      test_id: testId,
      part_number: 3,
      category,
      topic: null as string | null,
      prompt_points: null as string[] | null,
      questions: qs,
      sort_order: i,
    })),
  ];
  const { error: sErr } = await supabase.from("ielts_speaking_prompts").insert(speaking);
  if (sErr) throw new Error(`insert ielts_speaking_prompts (test ${test.test_id}): ${sErr.message}`);

  console.log(
    `  ✓ Test ${test.test_id}: ${questions.length} questions, 2 writing tasks, ` +
      `${speaking.length} speaking prompts`
  );
}

async function main(): Promise<void> {
  console.log(`Seeding "${book.book}" (${book.tests.length} tests) …`);
  for (const test of book.tests) {
    await seedTest(test);
  }
  console.log("✓ Done.");
}

main().catch((err) => {
  console.error("✗ Seed failed:", err instanceof Error ? err.message : err);
  process.exit(1);
});
