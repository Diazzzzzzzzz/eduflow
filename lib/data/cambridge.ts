/**
 * Server-side access to Cambridge practice tests + submission scoring.
 * Reads from Supabase when configured, else falls back to the bundled sample.
 * SERVER ONLY — imports the service-role client and holds the answer keys.
 */
import { createAdminClient } from "@/lib/supabase/server";
import { sampleTestForSection } from "@/lib/cambridge-sample";
import { isAnswerCorrect, rawToBand } from "@/lib/scoring";
import type {
  CambridgeTest,
  CambridgeTestFull,
  EngineQuestionFull,
  QuestionType,
  SubmissionResult,
} from "@/lib/cambridge-types";

type QuestionRow = {
  id: string;
  question_number: number;
  question_type: QuestionType;
  prompt: string;
  options: string[] | null;
  correct_answer: string;
  explanation: string | null;
};
type PassageRow = {
  id: string;
  passage_number: number;
  title: string;
  text_content: string;
  audio_url: string | null;
  test_questions: QuestionRow[] | null;
};
type TestRow = {
  id: string;
  book_number: number;
  test_number: number;
  title: string;
  section_type: CambridgeTestFull["sectionType"];
  test_passages: PassageRow[] | null;
};

function mapTest(row: TestRow): CambridgeTestFull {
  return {
    id: row.id,
    bookNumber: row.book_number,
    testNumber: row.test_number,
    title: row.title,
    sectionType: row.section_type,
    passages: (row.test_passages ?? [])
      .slice()
      .sort((a, b) => a.passage_number - b.passage_number)
      .map((p) => ({
        id: p.id,
        passageNumber: p.passage_number,
        title: p.title,
        textContent: p.text_content,
        audioUrl: p.audio_url,
        questions: (p.test_questions ?? [])
          .slice()
          .sort((a, b) => a.question_number - b.question_number)
          .map((q) => ({
            id: q.id,
            questionNumber: q.question_number,
            type: q.question_type,
            prompt: q.prompt,
            options: q.options,
            correctAnswer: q.correct_answer,
            explanation: q.explanation,
          })),
      })),
  };
}

/** Full test incl. answer keys (server-side only). */
export async function loadFullTest(
  section: string
): Promise<CambridgeTestFull | null> {
  const supabase = createAdminClient();
  if (!supabase) return sampleTestForSection(section);
  try {
    const { data, error } = await supabase
      .from("cambridge_tests")
      .select("*, test_passages(*, test_questions(*))")
      .eq("section_type", section)
      .order("test_number", { ascending: true })
      .limit(1)
      .maybeSingle();
    if (error || !data) return sampleTestForSection(section);
    return mapTest(data as unknown as TestRow);
  } catch {
    return sampleTestForSection(section);
  }
}

/** Public test with answer keys stripped, safe to send to the browser. */
export function toPublicTest(full: CambridgeTestFull): CambridgeTest {
  return {
    ...full,
    passages: full.passages.map((p) => ({
      ...p,
      questions: p.questions.map(({ correctAnswer, explanation, ...pub }) => {
        void correctAnswer;
        void explanation;
        return pub;
      }),
    })),
  };
}

function allQuestions(full: CambridgeTestFull): EngineQuestionFull[] {
  return full.passages.flatMap((p) => p.questions);
}

/** Score a set of answers against a full test. */
export function scoreSubmission(
  full: CambridgeTestFull,
  answers: Record<string, string>
): SubmissionResult {
  const questions = allQuestions(full);
  const scored =
    full.sectionType === "reading" || full.sectionType === "listening";

  const results = questions.map((q) => {
    const given = answers[q.id] ?? "";
    const correct = isAnswerCorrect(q.type, given, q.correctAnswer);
    return {
      questionId: q.id,
      questionNumber: q.questionNumber,
      correct,
      given,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
    };
  });

  const correctCount = results.filter((r) => r.correct).length;
  const band =
    scored && questions.length > 0
      ? rawToBand(correctCount, questions.length, full.sectionType as "reading" | "listening")
      : null;

  return {
    total: questions.length,
    correct: correctCount,
    band,
    results,
    scored,
  };
}

/** Persist a submission when Supabase is configured (best-effort). */
export async function saveSubmission(input: {
  studentId: string | null;
  testId: string;
  answers: Record<string, string>;
  band: number | null;
}): Promise<boolean> {
  const supabase = createAdminClient();
  if (!supabase || !input.studentId) return false;
  // Only persist when the test id is a real UUID (DB-backed), not a sample id.
  const isUuid =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      input.testId
    );
  if (!isUuid) return false;
  const { error } = await supabase.from("student_submissions").insert({
    student_id: input.studentId,
    test_id: input.testId,
    answers: input.answers,
    band_score: input.band,
  } as never);
  return !error;
}
