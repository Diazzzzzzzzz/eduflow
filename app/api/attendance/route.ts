import { NextResponse } from "next/server";
import { listAttendance, markAttendance } from "@/lib/data/attendance";
import { requireSession } from "@/lib/supabase/auth-server";
import { isStaff } from "@/lib/auth-routes";
import type { AttendanceStatus } from "@/lib/group-data";

export const dynamic = "force-dynamic";

const STATUSES: AttendanceStatus[] = ["present", "late", "absent"];

/**
 * GET /api/attendance?group=IELTS%2062 — marks the caller may see.
 * Staff get their centre (optionally one group); a student or parent gets the
 * student's own rows regardless of the filter — RLS decides, not the query.
 */
export async function GET(request: Request) {
  const gate = await requireSession();
  if ("error" in gate) {
    return NextResponse.json({ error: gate.error }, { status: gate.status });
  }
  const group = new URL(request.url).searchParams.get("group") ?? undefined;
  return NextResponse.json({ attendance: await listAttendance({ groupName: group }) });
}

/**
 * POST /api/attendance — staff mark one student for one date.
 * The group is resolved server-side from the student's enrollment; the body
 * carries only studentId, date and status.
 */
export async function POST(request: Request) {
  const gate = await requireSession();
  if ("error" in gate) {
    return NextResponse.json({ error: gate.error }, { status: gate.status });
  }
  if (!isStaff(gate.session.profile?.role)) {
    return NextResponse.json(
      { error: "Отмечать посещаемость может преподаватель или директор." },
      { status: 403 }
    );
  }

  let body: { studentId?: string; date?: string; status?: AttendanceStatus };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Некорректный запрос" }, { status: 400 });
  }

  if (
    !body.studentId ||
    !body.date ||
    !/^\d{4}-\d{2}-\d{2}$/.test(body.date) ||
    !body.status ||
    !STATUSES.includes(body.status)
  ) {
    return NextResponse.json(
      { error: "Нужны studentId, date (YYYY-MM-DD) и status (present|late|absent)" },
      { status: 422 }
    );
  }

  const res = await markAttendance(
    body.studentId,
    body.date,
    body.status,
    gate.session.user.id
  );
  if (!res.ok) {
    return NextResponse.json({ error: res.error }, { status: 403 });
  }
  return NextResponse.json({ ok: true }, { status: 201 });
}
