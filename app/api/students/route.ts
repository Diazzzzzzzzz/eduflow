import { NextResponse } from "next/server";
import { getStudents } from "@/lib/data/students";

// Always run fresh: reflects live database state, and avoids caching mock data
// if the database becomes configured later.
export const dynamic = "force-dynamic";

/**
 * GET /api/students — cohort roster with full mock-test history.
 * Reads from Supabase when configured, otherwise returns the mock cohort.
 * The `source` field tells the client which path served the data.
 */
export async function GET() {
  const { students, source } = await getStudents();
  return NextResponse.json({ students, source });
}
