import { NextResponse } from "next/server";
import { loadFullTest, toPublicTest } from "@/lib/data/cambridge";
import { requireSession } from "@/lib/supabase/auth-server";
import { SKILLS } from "@/lib/types";

export const dynamic = "force-dynamic";

/**
 * GET /api/cambridge?section=reading — returns the test for a section with
 * answer keys stripped. Authenticated users only.
 */
export async function GET(request: Request) {
  const gate = await requireSession();
  if ("error" in gate) {
    return NextResponse.json({ error: gate.error }, { status: gate.status });
  }

  const section = new URL(request.url).searchParams.get("section") ?? "";
  if (!SKILLS.includes(section as (typeof SKILLS)[number])) {
    return NextResponse.json({ error: "unknown section" }, { status: 400 });
  }
  const full = await loadFullTest(section);
  if (!full) {
    return NextResponse.json({ error: "no test for section" }, { status: 404 });
  }
  return NextResponse.json({ test: toPublicTest(full) });
}
