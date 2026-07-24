/**
 * Data-fetching + answer-checking service for the Cambridge IELTS 19 dataset
 * (tables from migration 0005).
 *
 * SERVER ONLY — uses the service-role client and reads answer keys. Call it
 * from server components / route handlers, and strip keys with
 * `toPublicQuestions` before sending questions to the browser.
 *
 * All reads gracefully return null / empty when Supabase isn't configured, so
 * the app keeps working on mock data elsewhere.
 */
import { createAdminClient } from "@/lib/supabase/server";
import { normalizeAnswer, rawToBand } from "@/lib/scoring";
import type {
  AnswerableSection,
  IeltsCheckResult,
  IeltsQuestionResult,
  IeltsQuestionRow,
  IeltsSpeakingPromptRow,
  IeltsTestRow,
  IeltsWritingTaskRow,
  PublicIeltsQuestion,
} from "@/lib/types/ielts";

/** A test with all of its related content loaded. */
export interface IeltsTestBundle {
  test: IeltsTestRow;
  questions: IeltsQuestionRow[];
  writingTasks: IeltsWritingTaskRow[];
  speakingPrompts: IeltsSpeakingPromptRow[];
}

/** List every seeded test (newest book first, ascending test number). */
export async function listTests(): Promise<IeltsTestRow[]> {
  const supabase = createAdminClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("ielts_tests")
    .select("*")
    .order("book", { ascending: false })
    .order("test_number", { ascending: true });
  if (error || !data) return [];
  return data as unknown as IeltsTestRow[];
}

/** Fetch a single test row by its UUID. */
export async function getTestById(testId: string): Promise<IeltsTestRow | null> {
  const supabase = createAdminClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("ielts_tests")
    .select("*")
    .eq("id", testId)
    .maybeSingle();
  if (error || !data) return null;
  return data as unknown as IeltsTestRow;
}

/** Fetch a test by human-facing number within a book (e.g. book 19, test 2). */
export async function getTestByNumber(
  book: string,
  testNumber: number
): Promise<IeltsTestRow | null> {
  const supabase = createAdminClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("ielts_tests")
    .select("*")
    .eq("book", book)
    .eq("test_number", testNumber)
    .maybeSingle();
  if (error || !data) return null;
  return data as unknown as IeltsTestRow;
}

/** Load the listening/reading questions for a test (optionally one section). */
export async function getSectionQuestions(
  testId: string,
  section?: AnswerableSection
): Promise<IeltsQuestionRow[]> {
  const supabase = createAdminClient();
  if (!supabase) return [];
  let query = supabase
    .from("ielts_questions")
    .select("*")
    .eq("test_id", testId);
  if (section) query = query.eq("section", section);
  const { data, error } = await query
    .order("section", { ascending: true })
    .order("sort_order", { ascending: true });
  if (error || !data) return [];
  return data as unknown as IeltsQuestionRow[];
}

/** Load a test with every related row in one call. */
export async function getTestBundle(testId: string): Promise<IeltsTestBundle | null> {
  const supabase = createAdminClient();
  if (!supabase) return null;
  const test = await getTestById(testId);
  if (!test) return null;

  const [questions, writing, speaking] = await Promise.all([
    getSectionQuestions(testId),
    supabase.from("ielts_writing_tasks").select("*").eq("test_id", testId).order("task_number"),
    supabase
      .from("ielts_speaking_prompts")
      .select("*")
      .eq("test_id", testId)
      .order("part_number")
      .order("sort_order"),
  ]);

  return {
    test,
    questions,
    writingTasks: (writing.data ?? []) as unknown as IeltsWritingTaskRow[],
    speakingPrompts: (speaking.data ?? []) as unknown as IeltsSpeakingPromptRow[],
  };
}

/** Strip answer keys so questions are safe to send to the browser. */
export function toPublicQuestions(
  questions: IeltsQuestionRow[]
): PublicIeltsQuestion[] {
  return questions.map(({ correct_answers, ...pub }) => {
    void correct_answers;
    return pub;
  });
}

/**
 * Compare a single student answer to a question's key.
 * - Multiple-answer questions (e.g. "21-22") match as a set, order-insensitive.
 * - Everything else matches case/space-insensitively against the key(s).
 */
function isCorrect(correctAnswers: string[], given: string[]): boolean {
  if (correctAnswers.length === 0) return false;

  if (correctAnswers.length > 1) {
    const key = correctAnswers.map(normalizeAnswer);
    const got = Array.from(
      new Set(given.map(normalizeAnswer).filter(Boolean))
    );
    return got.length === key.length && got.every((a) => key.includes(a));
  }

  const key = correctAnswers[0].split("|").map(normalizeAnswer);
  return given.some((g) => key.includes(normalizeAnswer(g)));
}

/**
 * Score a student's answers for one auto-scorable section.
 *
 * `answers` is keyed by `question_ref` (e.g. "7", "21-22"). Each value is a
 * string, or a string array for multi-answer questions.
 */
export async function checkAnswers(
  testId: string,
  section: AnswerableSection,
  answers: Record<string, string | string[]>
): Promise<IeltsCheckResult> {
  const questions = await getSectionQuestions(testId, section);

  const results: IeltsQuestionResult[] = questions.map((q) => {
    const raw = answers[q.question_ref];
    const given = raw == null ? [] : Array.isArray(raw) ? raw : [raw];
    return {
      questionRef: q.question_ref,
      correct: isCorrect(q.correct_answers, given),
      given,
      correctAnswers: q.correct_answers,
    };
  });

  const correct = results.filter((r) => r.correct).length;
  const band =
    questions.length > 0 ? rawToBand(correct, questions.length, section) : null;

  return { section, total: questions.length, correct, band, results };
}
