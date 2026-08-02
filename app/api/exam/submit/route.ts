import { NextResponse } from "next/server";
import { gradeSection, loadFullSection } from "@/lib/exam/service";
import { saveAttempt } from "@/lib/data/exam-attempts";
import { isDemoSession } from "@/lib/demo-session";
import { requireSession } from "@/lib/supabase/auth-server";
import type { AnswerMap, AnswerValue } from "@/lib/exam/types";

export const dynamic = "force-dynamic";

interface SubmitBody {
  sectionId?: string;
  skill?: string;
  // studentId is intentionally NOT read from the body — the result is always
  // attributed to the signed-in student, derived from the session below.
  answers?: Record<string, unknown>;
  durationSeconds?: number;
}

/** Keep only the shapes the scorer understands, so bad input can't throw. */
function sanitizeAnswers(input: Record<string, unknown>): AnswerMap {
  const out: AnswerMap = {};
  for (const [key, value] of Object.entries(input)) {
    let v: AnswerValue | null = null;
    if (typeof value === "string") v = value;
    else if (Array.isArray(value)) {
      v = value.filter((x): x is string => typeof x === "string");
    }
    if (v !== null) out[key] = v;
  }
  return out;
}

/**
 * POST /api/exam/submit — grades a paper server-side and returns the band,
 * per-question marks and explanations. Answer keys are never sent on GET, so
 * this is the only route that can reveal them, and only after submission.
 */
export async function POST(request: Request) {
  const gate = await requireSession();
  if ("error" in gate) {
    return NextResponse.json({ error: gate.error }, { status: gate.status });
  }
  // Attribute the attempt to the caller when they are a student; staff
  // previewing a paper simply don't persist a per-student row.
  //
  // A demo session is excluded even though its persona carries a real
  // student_id: the showcase must never write to the centre's database, and
  // without this every demo run would land in that student's real history.
  const isDemo = isDemoSession(gate.session.user.id);
  const studentId =
    !isDemo && gate.session.profile?.role === "student"
      ? gate.session.profile?.student_id ?? null
      : null;

  let body: Partial<SubmitBody>;
  try {
    body = (await request.json()) as Partial<SubmitBody>;
  } catch {
    return NextResponse.json({ error: "Некорректный запрос" }, { status: 400 });
  }

  const full = await loadFullSection({
    sectionId: body.sectionId,
    skill: body.skill,
  });
  if (!full) {
    return NextResponse.json({ error: "Тест не найден" }, { status: 404 });
  }

  const answers = sanitizeAnswers(body.answers ?? {});
  const duration =
    typeof body.durationSeconds === "number" && body.durationSeconds >= 0
      ? Math.round(body.durationSeconds)
      : undefined;

  const result = gradeSection(full, answers, duration);

  // Best-effort persistence; scoring must still return if the database is down.
  //
  // This used to write to student_submissions, whose test_id is a FK to the
  // (now removed) cambridge_tests. A paper is identified by slug, so every
  // attempt failed that check silently and nothing was ever recorded.
  let persisted = false;
  try {
    persisted = await saveAttempt({
      studentId,
      paperSlug: full.id,
      paperTitle: full.title,
      skill: full.skill,
      correct: result.correct,
      total: result.total,
      band: result.band,
      answers: Object.fromEntries(
        Object.entries(answers).map(([k, v]) => [
          k,
          Array.isArray(v) ? v.join(", ") : v,
        ])
      ),
      durationSeconds: duration,
    });
  } catch {
    persisted = false;
  }

  return NextResponse.json({ ...result, persisted });
}
