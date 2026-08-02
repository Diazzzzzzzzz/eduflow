/**
 * Results from the lib/exam test runner.
 *
 * Writes go through the service-role client from the submit route: the band is
 * computed server-side from the answer keys, so letting a browser insert its
 * own row would let a student post any score they liked. Reads run under the
 * caller's session, so RLS (migration 0016) decides whose attempts come back —
 * own for a student, wards for a parent, the centre for staff.
 *
 * SERVER ONLY.
 */
import { createRlsClient } from "@/lib/supabase/auth-server";
import { createAdminClient } from "@/lib/supabase/server";

export interface ExamAttempt {
  id: string;
  paperSlug: string;
  paperTitle: string;
  skill: "reading" | "listening";
  correct: number;
  total: number;
  band: number | null;
  durationSeconds: number | null;
  completedAt: string;
}

interface AttemptRow {
  id: string;
  paper_slug: string;
  paper_title: string;
  skill: "reading" | "listening";
  correct: number;
  total: number;
  band: number | string | null;
  duration_seconds: number | null;
  completed_at: string;
}

function mapAttempt(r: AttemptRow): ExamAttempt {
  return {
    id: r.id,
    paperSlug: r.paper_slug,
    paperTitle: r.paper_title,
    skill: r.skill,
    correct: r.correct,
    total: r.total,
    band: r.band == null ? null : Number(r.band),
    durationSeconds: r.duration_seconds,
    completedAt: r.completed_at,
  };
}

/**
 * Record a finished attempt. Best-effort: a scored result must still reach the
 * student even if the database is unreachable, so this reports success rather
 * than throwing.
 *
 * `paperTitle` and `skill` are stored alongside the slug because an attempt is
 * a historical fact — it has to stay readable after the paper is re-imported,
 * renamed, or dropped from the catalogue.
 */
export async function saveAttempt(input: {
  studentId: string | null;
  paperSlug: string;
  paperTitle: string;
  skill: "reading" | "listening";
  correct: number;
  total: number;
  band: number | null;
  answers: Record<string, string>;
  durationSeconds?: number;
}): Promise<boolean> {
  if (!input.studentId) return false;
  const supabase = createAdminClient();
  if (!supabase) return false;

  const { error } = await supabase.from("exam_attempts").insert({
    student_id: input.studentId,
    paper_slug: input.paperSlug,
    paper_title: input.paperTitle,
    skill: input.skill,
    correct: input.correct,
    total: input.total,
    band: input.band,
    answers: input.answers,
    duration_seconds: input.durationSeconds ?? null,
  } as never);

  if (error) {
    console.warn("[data/exam-attempts] insert failed:", error.message);
    return false;
  }
  return true;
}

/**
 * Attempts visible to the caller, newest first. Returns [] when Supabase is
 * unconfigured or the read is refused, so the history screen degrades to empty
 * rather than erroring.
 */
export async function listAttempts(
  studentId?: string | null,
  limit = 50
): Promise<ExamAttempt[]> {
  const supabase = createRlsClient();
  if (!supabase) return [];

  try {
    let query = supabase
      .from("exam_attempts")
      .select(
        "id, paper_slug, paper_title, skill, correct, total, band, duration_seconds, completed_at"
      )
      .order("completed_at", { ascending: false })
      .limit(limit);
    if (studentId) query = query.eq("student_id", studentId);

    const { data, error } = await query;
    if (error) {
      console.warn("[data/exam-attempts] read failed:", error.message);
      return [];
    }
    return ((data as unknown as AttemptRow[]) ?? []).map(mapAttempt);
  } catch (err) {
    console.warn("[data/exam-attempts] unexpected:", err);
    return [];
  }
}
