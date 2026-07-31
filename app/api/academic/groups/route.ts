import { NextResponse } from "next/server";
import {
  assignCourse,
  assignTeacher,
  listCourses,
  listGroups,
} from "@/lib/data/academic";
import { requireSession } from "@/lib/supabase/auth-server";
import { canAccessAdmin } from "@/lib/auth-routes";

export const dynamic = "force-dynamic";

/**
 * GET /api/academic/groups — groups (with teacher, course, headcount) plus the
 * course list. Scoped by RLS: staff see their centre, a student or parent sees
 * only their own group.
 */
export async function GET() {
  const gate = await requireSession();
  if ("error" in gate) {
    return NextResponse.json({ error: gate.error }, { status: gate.status });
  }
  const [groups, courses] = await Promise.all([listGroups(), listCourses()]);
  return NextResponse.json({ groups, courses });
}

/**
 * PATCH /api/academic/groups — assign the group's teacher or course.
 * Leadership only: deciding who runs a class is an administrative act.
 */
export async function PATCH(request: Request) {
  const gate = await requireSession();
  if ("error" in gate) {
    return NextResponse.json({ error: gate.error }, { status: gate.status });
  }
  if (!canAccessAdmin(gate.session.profile?.role)) {
    return NextResponse.json(
      { error: "Недостаточно прав: назначение доступно директору." },
      { status: 403 }
    );
  }

  let body: { groupId?: string; teacherId?: string | null; courseId?: string | null };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Некорректный запрос" }, { status: 400 });
  }
  if (!body.groupId) {
    return NextResponse.json({ error: "Нужен groupId" }, { status: 422 });
  }

  if (body.teacherId !== undefined) {
    const res = await assignTeacher(body.groupId, body.teacherId);
    if (!res.ok) return NextResponse.json({ error: res.error }, { status: 403 });
  }
  if (body.courseId !== undefined) {
    const res = await assignCourse(body.groupId, body.courseId);
    if (!res.ok) return NextResponse.json({ error: res.error }, { status: 403 });
  }

  return NextResponse.json({ ok: true, groups: await listGroups() });
}
