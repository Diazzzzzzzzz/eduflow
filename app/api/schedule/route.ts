import { NextResponse } from "next/server";
import { listClassSessions, scheduleClassSession } from "@/lib/data/schedule";
import { requireSession } from "@/lib/supabase/auth-server";
import { isStaff } from "@/lib/auth-routes";

export const dynamic = "force-dynamic";

/**
 * GET /api/schedule?group=IELTS%2062 — scheduled lessons.
 * Any signed-in role may ask; RLS returns only their slice (a student sees
 * their own group's timetable).
 */
export async function GET(request: Request) {
  const gate = await requireSession();
  if ("error" in gate) {
    return NextResponse.json({ error: gate.error }, { status: gate.status });
  }
  const group = new URL(request.url).searchParams.get("group") ?? undefined;
  return NextResponse.json({ sessions: await listClassSessions(group) });
}

/** POST /api/schedule — plan a lesson (date + topic). Staff only. */
export async function POST(request: Request) {
  const gate = await requireSession();
  if ("error" in gate) {
    return NextResponse.json({ error: gate.error }, { status: gate.status });
  }
  if (!isStaff(gate.session.profile?.role)) {
    return NextResponse.json(
      { error: "Планировать занятия может преподаватель или директор." },
      { status: 403 }
    );
  }

  let body: {
    groupName?: string;
    date?: string;
    topic?: string;
    lessonNumber?: number;
  };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Некорректный запрос" }, { status: 400 });
  }

  if (!body.groupName || !body.date || !/^\d{4}-\d{2}-\d{2}$/.test(body.date)) {
    return NextResponse.json(
      { error: "Нужны groupName и date (YYYY-MM-DD)" },
      { status: 422 }
    );
  }

  const res = await scheduleClassSession({
    groupName: body.groupName,
    date: body.date,
    topic: body.topic,
    lessonNumber: body.lessonNumber,
  });
  if (!res.ok) {
    return NextResponse.json({ error: res.error }, { status: 403 });
  }
  return NextResponse.json({ ok: true, id: res.id }, { status: 201 });
}
