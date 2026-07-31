import { NextResponse } from "next/server";
import {
  enrollStudent,
  listEnrollments,
  setEnrollmentStatus,
} from "@/lib/data/academic";
import { requireSession } from "@/lib/supabase/auth-server";
import { isStaff } from "@/lib/auth-routes";

export const dynamic = "force-dynamic";

/** GET /api/academic/enrollments?group=<id> — scoped by RLS. */
export async function GET(request: Request) {
  const gate = await requireSession();
  if ("error" in gate) {
    return NextResponse.json({ error: gate.error }, { status: gate.status });
  }
  const groupId = new URL(request.url).searchParams.get("group") ?? undefined;
  return NextResponse.json({ enrollments: await listEnrollments(groupId) });
}

/**
 * POST /api/academic/enrollments — put a student in a group.
 * Staff only; RLS additionally rejects a student outside the caller's centre.
 */
export async function POST(request: Request) {
  const gate = await requireSession();
  if ("error" in gate) {
    return NextResponse.json({ error: gate.error }, { status: gate.status });
  }
  if (!isStaff(gate.session.profile?.role)) {
    return NextResponse.json(
      { error: "Недостаточно прав: зачисление доступно преподавателю или директору." },
      { status: 403 }
    );
  }

  let body: { studentId?: string; groupId?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Некорректный запрос" }, { status: 400 });
  }
  if (!body.studentId || !body.groupId) {
    return NextResponse.json(
      { error: "Нужны studentId и groupId" },
      { status: 422 }
    );
  }

  const res = await enrollStudent(body.studentId, body.groupId);
  if (!res.ok) {
    return NextResponse.json(
      { error: res.error ?? "Нет доступа к этому студенту." },
      { status: 403 }
    );
  }
  return NextResponse.json({ ok: true }, { status: 201 });
}

/** PATCH /api/academic/enrollments — change status (withdrawn/completed). */
export async function PATCH(request: Request) {
  const gate = await requireSession();
  if ("error" in gate) {
    return NextResponse.json({ error: gate.error }, { status: gate.status });
  }
  if (!isStaff(gate.session.profile?.role)) {
    return NextResponse.json({ error: "Недостаточно прав." }, { status: 403 });
  }

  let body: { enrollmentId?: string; status?: "active" | "completed" | "withdrawn" };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Некорректный запрос" }, { status: 400 });
  }
  if (!body.enrollmentId || !body.status) {
    return NextResponse.json(
      { error: "Нужны enrollmentId и status" },
      { status: 422 }
    );
  }

  const res = await setEnrollmentStatus(body.enrollmentId, body.status);
  if (!res.ok) return NextResponse.json({ error: res.error }, { status: 403 });
  return NextResponse.json({ ok: true });
}
