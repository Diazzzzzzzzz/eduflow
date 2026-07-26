import { NextResponse } from "next/server";
import { gradeSection, loadFullSection } from "@/lib/exam/service";
import { saveSubmission } from "@/lib/data/cambridge";
import type { AnswerMap, AnswerValue } from "@/lib/exam/types";

export const dynamic = "force-dynamic";

interface SubmitBody {
  sectionId?: string;
  skill?: string;
  studentId?: string | null;
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
  let persisted = false;
  try {
    persisted = await saveSubmission({
      studentId: body.studentId ?? null,
      testId: full.id,
      answers: Object.fromEntries(
        Object.entries(answers).map(([k, v]) => [
          k,
          Array.isArray(v) ? v.join(", ") : v,
        ])
      ),
      band: result.band,
    });
  } catch {
    persisted = false;
  }

  return NextResponse.json({ ...result, persisted });
}
