import { NextResponse } from "next/server";
import { listGuardianships } from "@/lib/data/academic";
import { createRlsClient, requireSession } from "@/lib/supabase/auth-server";
import { canAccessAdmin } from "@/lib/auth-routes";
import { createAdminClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/** GET /api/academic/guardians — links the caller may see (RLS-scoped). */
export async function GET() {
  const gate = await requireSession();
  if ("error" in gate) {
    return NextResponse.json({ error: gate.error }, { status: gate.status });
  }
  return NextResponse.json({ guardianships: await listGuardianships() });
}

/**
 * POST /api/academic/guardians — link a parent account to a child.
 *
 * Leadership only, and deliberately so: this grants one person visibility of
 * another person's data, the most sensitive write in the app.
 *
 * Uses the service-role client for exactly one thing — resolving the parent's
 * e-mail to a user id, which requires auth.users and no RLS policy can expose
 * it to a session. Authority is checked first, and the child is confirmed
 * visible UNDER THE CALLER'S OWN SESSION, so this cannot reach another centre.
 */
export async function POST(request: Request) {
  const gate = await requireSession();
  if ("error" in gate) {
    return NextResponse.json({ error: gate.error }, { status: gate.status });
  }
  if (!canAccessAdmin(gate.session.profile?.role)) {
    return NextResponse.json(
      { error: "Недостаточно прав: связывать родителя и ребёнка может директор." },
      { status: 403 }
    );
  }

  let body: { parentEmail?: string; studentId?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Некорректный запрос" }, { status: 400 });
  }
  const email = body.parentEmail?.trim().toLowerCase();
  if (!email || !body.studentId) {
    return NextResponse.json(
      { error: "Нужны parentEmail и studentId" },
      { status: 422 }
    );
  }

  const rls = createRlsClient();
  const admin = createAdminClient();
  if (!rls || !admin) {
    return NextResponse.json(
      { error: "База данных не настроена." },
      { status: 500 }
    );
  }

  // Centre check, under the caller's session.
  const visible = await rls
    .from("students")
    .select("id")
    .eq("id", body.studentId)
    .maybeSingle();
  if (!visible.data) {
    return NextResponse.json(
      { error: "Студент не найден в вашем центре." },
      { status: 403 }
    );
  }

  let parentId: string | null = null;
  for (let page = 1; page <= 20 && !parentId; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) break;
    parentId = data.users.find((u) => u.email?.toLowerCase() === email)?.id ?? null;
    if (data.users.length < 200) break;
  }
  if (!parentId) {
    return NextResponse.json(
      {
        error:
          "Аккаунт родителя с таким email не найден — сначала он должен зарегистрироваться.",
      },
      { status: 404 }
    );
  }

  const { error } = await admin.from("guardianships").upsert(
    { parent_user_id: parentId, student_id: body.studentId } as never,
    { onConflict: "parent_user_id,student_id" }
  );
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}

/** DELETE /api/academic/guardians?id=… — revoke a link (RLS-enforced). */
export async function DELETE(request: Request) {
  const gate = await requireSession();
  if ("error" in gate) {
    return NextResponse.json({ error: gate.error }, { status: gate.status });
  }
  if (!canAccessAdmin(gate.session.profile?.role)) {
    return NextResponse.json({ error: "Недостаточно прав." }, { status: 403 });
  }
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Нужен id" }, { status: 422 });

  const rls = createRlsClient();
  if (!rls) {
    return NextResponse.json({ error: "База данных не настроена." }, { status: 500 });
  }

  // The staff delete policy (0012) limits this to links whose student is in the
  // caller's centre.
  const { error } = await rls.from("guardianships").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 403 });
  return NextResponse.json({ ok: true });
}
