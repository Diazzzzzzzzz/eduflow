import { NextResponse } from "next/server";
import {
  loadFullTest,
  saveSubmission,
  scoreSubmission,
} from "@/lib/data/cambridge";
import { requireSession } from "@/lib/supabase/auth-server";
import { SKILLS } from "@/lib/types";

export const dynamic = "force-dynamic";

interface SubmitBody {
  section: string;
  // studentId is derived from the session, never trusted from the body.
  answers: Record<string, string>;
}

/**
 * POST /api/cambridge/submit — scores answers server-side (keys never leave the
 * server on GET), persists the submission when possible, and returns the band,
 * per-question correctness, and explanations.
 */
export async function POST(request: Request) {
  const gate = await requireSession();
  if ("error" in gate) {
    return NextResponse.json({ error: gate.error }, { status: gate.status });
  }
  const studentId =
    gate.session.profile?.role === "student"
      ? gate.session.profile?.student_id ?? null
      : null;

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
    studentId,
    testId: full.id,
    answers,
    band: result.band,
  });

  return NextResponse.json({ ...result, persisted });
}
