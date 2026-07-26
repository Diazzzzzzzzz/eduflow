import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { getUserProfile } from "@/lib/supabase/auth-server";
import { canAccessAdmin } from "@/lib/auth-routes";

export const dynamic = "force-dynamic";

const CENTER_ID = "11111111-1111-1111-1111-111111111111";

async function requireAdmin() {
  const session = await getUserProfile();
  if (!session) return { error: "Требуется вход.", status: 401 as const };
  if (!canAccessAdmin(session.profile?.role)) {
    return { error: "Доступ только для администрации школы.", status: 403 as const };
  }
  return null;
}

function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/**
 * POST /api/admin/users — add a student or a staff member to the centre.
 *
 * Creates the domain row only. A portal login is a separate step (Supabase
 * Auth), so the response says whether the person can sign in yet.
 */
export async function POST(request: Request) {
  const denied = await requireAdmin();
  if (denied) {
    return NextResponse.json({ error: denied.error }, { status: denied.status });
  }

  let body: {
    kind?: "student" | "teacher";
    name?: string;
    email?: string;
    group?: string;
    targetBand?: number;
  };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Некорректный запрос" }, { status: 400 });
  }

  const name = body.name?.trim();
  if (!name) {
    return NextResponse.json({ error: "Укажите имя" }, { status: 422 });
  }
  const email = body.email?.trim() || null;
  if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return NextResponse.json({ error: "Некорректный email" }, { status: 422 });
  }

  const supabase = createAdminClient();
  if (!supabase) {
    return NextResponse.json(
      { error: "База данных не настроена — добавление недоступно." },
      { status: 503 }
    );
  }

  if (body.kind === "teacher") {
    const { error } = await supabase.from("teachers").insert({
      center_id: CENTER_ID,
      name,
      role: "teacher",
    } as never);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(
      {
        created: "teacher",
        name,
        canSignIn: false,
        note: "Преподаватель добавлен в состав центра. Доступ в портал выдаётся отдельно.",
      },
      { status: 201 }
    );
  }

  const group = body.group?.trim();
  if (!group) {
    return NextResponse.json({ error: "Выберите группу" }, { status: 422 });
  }
  const targetBand = body.targetBand ?? 6.5;
  if (targetBand < 1 || targetBand > 9) {
    return NextResponse.json(
      { error: "Целевой балл должен быть от 1.0 до 9.0" },
      { status: 422 }
    );
  }

  const { error } = await supabase.from("students").insert({
    center_id: CENTER_ID,
    name,
    initials: initialsOf(name),
    email,
    student_group: group,
    target_band: targetBand,
    attendance: 100,
    teacher_note: "",
  } as never);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(
    {
      created: "student",
      name,
      group,
      canSignIn: false,
      note: "Студент добавлен. Доступ в портал выдаётся отдельно.",
    },
    { status: 201 }
  );
}

/** PATCH /api/admin/users — move a student to another group. */
export async function PATCH(request: Request) {
  const denied = await requireAdmin();
  if (denied) {
    return NextResponse.json({ error: denied.error }, { status: denied.status });
  }

  let body: { studentId?: string; group?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Некорректный запрос" }, { status: 400 });
  }

  const { studentId, group } = body;
  if (!studentId || !group?.trim()) {
    return NextResponse.json(
      { error: "Нужны studentId и group" },
      { status: 422 }
    );
  }

  const supabase = createAdminClient();
  if (!supabase) {
    return NextResponse.json(
      { error: "База данных не настроена — перевод недоступен." },
      { status: 503 }
    );
  }

  const { error } = await supabase
    .from("students")
    .update({ student_group: group.trim() } as never)
    .eq("id", studentId);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ studentId, group: group.trim() });
}
