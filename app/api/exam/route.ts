import { NextResponse } from "next/server";
import { loadFullSection, toPublicSection } from "@/lib/exam/service";
import { requireSession } from "@/lib/supabase/auth-server";

export const dynamic = "force-dynamic";

/**
 * GET /api/exam?skill=reading — the exam paper without any answer keys.
 * `?id=` selects a specific section when more than one exists for a skill.
 * Authenticated users only; the paper is centre content.
 */
export async function GET(request: Request) {
  const gate = await requireSession();
  if ("error" in gate) {
    return NextResponse.json({ error: gate.error }, { status: gate.status });
  }

  const { searchParams } = new URL(request.url);
  const full = await loadFullSection({
    sectionId: searchParams.get("id"),
    skill: searchParams.get("skill"),
  });

  if (!full) {
    return NextResponse.json(
      { error: "Для этой секции пока нет теста" },
      { status: 404 }
    );
  }

  return NextResponse.json({ section: toPublicSection(full) });
}
