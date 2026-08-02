/**
 * Persistence for exam submissions.
 *
 * This is what remains of the original Cambridge practice engine (migration
 * 0002). That engine is gone: the `cambridge_tests` rows it served had no
 * passage body at all — the reading test carried 12 questions against an empty
 * passage, listening had neither audio nor transcript, and writing and speaking
 * had no questions — so every screen it rendered was unanswerable. Its API
 * routes and UI have been removed; lib/exam is the only test runner now.
 *
 * This one function stays because the exam engine writes results through it.
 * SERVER ONLY — uses the service-role client.
 */
import { createAdminClient } from "@/lib/supabase/server";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Persist a submission when Supabase is configured (best-effort). */
export async function saveSubmission(input: {
  studentId: string | null;
  testId: string;
  answers: Record<string, string>;
  band: number | null;
}): Promise<boolean> {
  const supabase = createAdminClient();
  if (!supabase || !input.studentId) return false;
  // student_submissions.test_id references a real row, so a bundled paper's
  // slug ("ielts-reading-practice-01") cannot be stored against it.
  if (!UUID.test(input.testId)) return false;
  const { error } = await supabase.from("student_submissions").insert({
    student_id: input.studentId,
    test_id: input.testId,
    answers: input.answers,
    band_score: input.band,
  } as never);
  return !error;
}
