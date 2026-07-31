import { NextResponse } from "next/server";
import { getGroupsForSession } from "@/lib/data/groups";
import { requireSession } from "@/lib/supabase/auth-server";

export const dynamic = "force-dynamic";

/**
 * GET /api/groups — the groups the caller may see.
 * Leadership gets the centre, a teacher their own, a student/parent the one
 * they belong to. Scope comes from the session, never from the request.
 */
export async function GET() {
  const gate = await requireSession();
  if ("error" in gate) {
    return NextResponse.json({ error: gate.error }, { status: gate.status });
  }
  return NextResponse.json({ groups: await getGroupsForSession(gate.session) });
}
