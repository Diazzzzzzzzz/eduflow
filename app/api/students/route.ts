import { NextResponse } from "next/server";
import { getStudentsForSession } from "@/lib/data/students";
import { requireSession } from "@/lib/supabase/auth-server";

// Always run fresh: reflects live database state, and avoids caching mock data
// if the database becomes configured later.
export const dynamic = "force-dynamic";

/**
 * GET /api/students — the cohort the CALLER is allowed to see.
 *
 * Scope is decided from the server session, never from the request: a student
 * gets only their own row, a parent only their wards, staff only their centre
 * (teachers additionally narrowed to their own groups). An unauthenticated
 * request is rejected outright.
 */
export async function GET() {
  const gate = await requireSession();
  if ("error" in gate) {
    return NextResponse.json({ error: gate.error }, { status: gate.status });
  }

  const { students, source } = await getStudentsForSession(gate.session);
  return NextResponse.json({ students, source });
}
