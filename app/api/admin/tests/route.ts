import { NextResponse } from "next/server";
import { getUserProfile } from "@/lib/supabase/auth-server";
import { canAccessAdmin, isStaff } from "@/lib/auth-routes";
import { validateImport } from "@/lib/exam/import-schema";
import {
  deletePaper,
  listStoredPapers,
  savePaper,
  setPaperPublished,
} from "@/lib/data/exam-papers";
import { listPapers as listBundledPapers } from "@/lib/exam/papers";

export const dynamic = "force-dynamic";

/** Import and deletion are leadership-only; reading the catalogue is staff-wide. */
async function requireRole(level: "read" | "write") {
  const session = await getUserProfile();
  if (!session) return { error: "Требуется вход.", status: 401 as const };
  const role = session.profile?.role;
  const allowed = level === "write" ? canAccessAdmin(role) : isStaff(role);
  if (!allowed) {
    return { error: "Недостаточно прав.", status: 403 as const };
  }
  return { session };
}

/** GET /api/admin/tests — imported papers plus the bundled originals. */
export async function GET() {
  const gate = await requireRole("read");
  if ("error" in gate) {
    return NextResponse.json({ error: gate.error }, { status: gate.status });
  }

  const [imported, bundled] = await Promise.all([
    listStoredPapers(),
    Promise.resolve(listBundledPapers()),
  ]);

  return NextResponse.json({
    imported,
    // Shipped with the app and not editable from here — shown for context so
    // the catalogue matches what students actually see.
    bundled: bundled.map((p) => ({
      slug: p.id,
      title: p.title,
      skill: p.skill,
      durationMinutes: p.durationMinutes,
      passages: p.passages,
      questions: p.questions,
    })),
  });
}

/**
 * POST /api/admin/tests — validate an uploaded paper and store it.
 *
 * `dryRun` validates without writing, which the upload UI uses to preview a
 * file before the operator commits to it.
 */
export async function POST(request: Request) {
  const gate = await requireRole("write");
  if ("error" in gate) {
    return NextResponse.json({ error: gate.error }, { status: gate.status });
  }

  let body: { paper?: unknown; dryRun?: boolean };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json(
      { error: "Файл не является корректным JSON." },
      { status: 400 }
    );
  }

  const result = validateImport(body.paper);
  if (!result.ok || !result.section) {
    return NextResponse.json(
      { error: "Файл не прошёл проверку схемы.", issues: result.issues },
      { status: 422 }
    );
  }

  if (body.dryRun) {
    return NextResponse.json({ valid: true, summary: result.summary });
  }

  const saved = await savePaper(
    result.section,
    gate.session.profile?.full_name ?? gate.session.user.email
  );
  if (!saved.ok) {
    return NextResponse.json({ error: saved.error }, { status: 500 });
  }

  return NextResponse.json(
    {
      slug: saved.slug,
      replaced: saved.replaced,
      summary: result.summary,
    },
    { status: 201 }
  );
}

/** PATCH /api/admin/tests — publish or hide a paper. */
export async function PATCH(request: Request) {
  const gate = await requireRole("write");
  if ("error" in gate) {
    return NextResponse.json({ error: gate.error }, { status: gate.status });
  }

  let body: { slug?: string; published?: boolean };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Некорректный запрос" }, { status: 400 });
  }
  if (!body.slug || typeof body.published !== "boolean") {
    return NextResponse.json(
      { error: "Нужны slug и published" },
      { status: 422 }
    );
  }

  const res = await setPaperPublished(body.slug, body.published);
  if (!res.ok) return NextResponse.json({ error: res.error }, { status: 500 });
  return NextResponse.json({ slug: body.slug, published: body.published });
}

/** DELETE /api/admin/tests?slug=… */
export async function DELETE(request: Request) {
  const gate = await requireRole("write");
  if ("error" in gate) {
    return NextResponse.json({ error: gate.error }, { status: gate.status });
  }

  const slug = new URL(request.url).searchParams.get("slug");
  if (!slug) {
    return NextResponse.json({ error: "Не указан slug" }, { status: 422 });
  }

  const res = await deletePaper(slug);
  if (!res.ok) return NextResponse.json({ error: res.error }, { status: 500 });
  return NextResponse.json({ slug, deleted: true });
}
