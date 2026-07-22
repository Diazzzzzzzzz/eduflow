import { NextResponse } from "next/server";
import {
  loadFullTest,
  saveSubmission,
  scoreSubmission,
} from "@/lib/data/cambridge";
import { SKILLS } from "@/lib/types";

export const dynamic = "force-dynamic";

interface SubmitBody {
  section: string;
  studentId?: string | null;
  answers: Record<string, string>;
}

/**
 * POST /api/cambridge/submit — scores answers server-side (keys never leave the
 * server on GET), persists the submission when possible, and returns the band,
 * per-question correctness, and explanations.
 */
export async function POST(request: Request) {
  const body = (await request.json()) as Partial<SubmitBody>;
  const section = body.section ?? "";
  if (!SKILLS.includes(section as (typeof SKILLS)[number])) {
    return NextResponse.json({ error: "unknown section" }, { status: 400 });
  }
  const answers = body.answers ?? {};

  const full = await loadFullTest(section);
  if (!full) {
    return NextResponse.json({ error: "no test for section" }, { status: 404 });
  }

  const result = scoreSubmission(full, answers);
  const persisted = await saveSubmission({
    studentId: body.studentId ?? null,
    testId: full.id,
    answers,
    band: result.band,
  });

  return NextResponse.json({ ...result, persisted });
}
