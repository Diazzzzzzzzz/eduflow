import { NextResponse } from "next/server";
import { getCourse, setCurrentLesson } from "@/lib/data/lessons";
import { getUserProfile } from "@/lib/supabase/auth-server";

export const dynamic = "force-dynamic";

/** GET /api/lessons?group=IELTS%2062 — syllabus plus the group's position. */
export async function GET(request: Request) {
  const group = new URL(request.url).searchParams.get("group");
  if (!group) {
    return NextResponse.json({ error: "Не указана группа" }, { status: 400 });
  }
  return NextResponse.json(await getCourse(group));
}

/**
 * PATCH /api/lessons — move a group to another lesson.
 * Staff only: a student must not be able to advance their own group.
 */
export async function PATCH(request: Request) {
  const session = await getUserProfile();
  if (!session) {
    return NextResponse.json({ error: "Требуется вход." }, { status: 401 });
  }
  if (session.profile?.role === "student") {
    return NextResponse.json(
      { error: "Менять текущий урок может только преподаватель." },
      { status: 403 }
    );
  }

  let body: { group?: string; currentLesson?: number };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Некорректный запрос" }, { status: 400 });
  }

  const { group, currentLesson } = body;
  if (!group || typeof currentLesson !== "number") {
    return NextResponse.json(
      { error: "Нужны group и currentLesson" },
      { status: 400 }
    );
  }

  // Bound the value against the actual syllabus rather than trusting the client.
  const course = await getCourse(group);
  if (
    !Number.isInteger(currentLesson) ||
    currentLesson < 1 ||
    currentLesson > course.total
  ) {
    return NextResponse.json(
      { error: `Урок должен быть в диапазоне 1–${course.total}` },
      { status: 422 }
    );
  }

  const result = await setCurrentLesson(group, currentLesson);
  return NextResponse.json(result);
}
