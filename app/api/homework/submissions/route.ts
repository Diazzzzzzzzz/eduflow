import { NextResponse } from "next/server";
import { gradeSubmission, submitHomework } from "@/lib/data/homework";
import { requireSession } from "@/lib/supabase/auth-server";
import { isStaff } from "@/lib/auth-routes";

export const dynamic = "force-dynamic";

/**
 * POST /api/homework/submissions — a student hands work in.
 *
 * The author is taken from the session; a studentId in the body is ignored, so
 * nobody can submit on someone else's behalf.
 */
export async function POST(request: Request) {
  const gate = await requireSession();
  if ("error" in gate) {
    return NextResponse.json({ error: gate.error }, { status: gate.status });
  }

  const profile = gate.session.profile;
  if (profile?.role !== "student" || !profile.student_id) {
    return NextResponse.json(
      { error: "Сдавать работу может только студент со своей учётной записи." },
      { status: 403 }
    );
  }

  let body: { homeworkId?: string; content?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Некорректный запрос" }, { status: 400 });
  }
  if (!body.homeworkId || typeof body.content !== "string") {
    return NextResponse.json(
      { error: "Нужны homeworkId и content" },
      { status: 422 }
    );
  }

  const res = await submitHomework(
    body.homeworkId,
    profile.student_id,
    body.content
  );
  if (!res.ok) {
    return NextResponse.json({ error: res.error }, { status: 403 });
  }
  return NextResponse.json({ ok: true }, { status: 201 });
}

/**
 * PATCH /api/homework/submissions — staff record a band and feedback.
 * The database trigger rejects a student attempting this even if the route
 * check were bypassed.
 */
export async function PATCH(request: Request) {
  const gate = await requireSession();
  if ("error" in gate) {
    return NextResponse.json({ error: gate.error }, { status: gate.status });
  }
  if (!isStaff(gate.session.profile?.role)) {
    return NextResponse.json(
      { error: "Проверять работы может преподаватель или директор." },
      { status: 403 }
    );
  }

  let body: {
    submissionId?: string;
    band?: number;
    feedback?: string;
    criteria?: {
      taskAchievement: number;
      coherence: number;
      lexical: number;
      grammar: number;
    } | null;
  };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Некорректный запрос" }, { status: 400 });
  }

  const band = body.band;
  if (
    !body.submissionId ||
    typeof band !== "number" ||
    band < 0 ||
    band > 9 ||
    Math.round(band * 2) !== band * 2
  ) {
    return NextResponse.json(
      { error: "Нужны submissionId и band (0.0–9.0 с шагом 0.5)" },
      { status: 422 }
    );
  }

  const res = await gradeSubmission(
    body.submissionId,
    band,
    body.feedback ?? "",
    body.criteria ?? null,
    gate.session.user.id
  );
  if (!res.ok) {
    return NextResponse.json({ error: res.error }, { status: 403 });
  }
  return NextResponse.json({ ok: true });
}
