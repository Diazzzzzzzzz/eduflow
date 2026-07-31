import { NextResponse } from "next/server";
import { createHomework, getHomeworkBoard } from "@/lib/data/homework";
import { requireSession } from "@/lib/supabase/auth-server";
import { isStaff } from "@/lib/auth-routes";

export const dynamic = "force-dynamic";

/**
 * GET /api/homework?group=IELTS%2062 — tasks plus their submissions.
 * Any signed-in role may ask; RLS returns only their slice (a student gets the
 * work set for their own group and only their own submission rows).
 */
export async function GET(request: Request) {
  const gate = await requireSession();
  if ("error" in gate) {
    return NextResponse.json({ error: gate.error }, { status: gate.status });
  }
  const group = new URL(request.url).searchParams.get("group") ?? undefined;
  const board = await getHomeworkBoard(group);
  return NextResponse.json(board);
}

/** POST /api/homework — set new work for a group. Staff only. */
export async function POST(request: Request) {
  const gate = await requireSession();
  if ("error" in gate) {
    return NextResponse.json({ error: gate.error }, { status: gate.status });
  }
  if (!isStaff(gate.session.profile?.role)) {
    return NextResponse.json(
      { error: "Выдавать задания может преподаватель или директор." },
      { status: 403 }
    );
  }

  let body: {
    groupName?: string;
    title?: string;
    description?: string;
    section?: string;
    dueDate?: string;
    minWords?: number;
    assignToStudentIds?: string[];
  };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Некорректный запрос" }, { status: 400 });
  }

  if (!body.groupName || !body.title?.trim()) {
    return NextResponse.json(
      { error: "Нужны groupName и title" },
      { status: 422 }
    );
  }

  const res = await createHomework(
    {
      groupName: body.groupName,
      title: body.title.trim(),
      description: body.description ?? "",
      section: (body.section as never) ?? "general",
      dueDate: body.dueDate ?? "",
      minWords: body.minWords,
      assignToStudentIds: body.assignToStudentIds,
    },
    gate.session.user.id
  );

  if (!res.ok) {
    return NextResponse.json({ error: res.error }, { status: 403 });
  }
  return NextResponse.json(
    { ok: true, homeworkId: res.homeworkId, ...(await getHomeworkBoard(body.groupName)) },
    { status: 201 }
  );
}
