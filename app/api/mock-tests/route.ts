import { NextResponse } from "next/server";
import { calcOverall } from "@/lib/band";
import { createMockResult } from "@/lib/data/students";
import type { SkillScores } from "@/lib/types";

export const dynamic = "force-dynamic";

interface AddResultBody extends SkillScores {
  studentId: string;
  label?: string;
  date?: string;
}

/**
 * POST /api/mock-tests — validate a mock result, persist it to Supabase when
 * configured, and return it with the computed overall band. When there's no
 * database, it still echoes the computed result (persisted=false) so the
 * client's localStorage flow keeps working.
 */
export async function POST(request: Request) {
  const body = (await request.json()) as Partial<AddResultBody>;
  const { studentId, listening, reading, writing, speaking } = body;

  const sections = { listening, reading, writing, speaking };
  const invalid = Object.entries(sections).filter(
    ([, v]) =>
      typeof v !== "number" || v < 0 || v > 9 || Math.round(v * 2) !== v * 2
  );

  if (!studentId || invalid.length > 0) {
    return NextResponse.json(
      {
        error:
          "studentId and all four section bands (0.0–9.0 in 0.5 steps) are required",
        invalidFields: invalid.map(([k]) => k),
      },
      { status: 400 }
    );
  }

  const scores = sections as SkillScores;
  const label = body.label ?? "Mock — Extra Practice";
  const date = body.date ?? new Date().toISOString().slice(0, 10);

  const { persisted, result } = await createMockResult({
    studentId,
    label,
    date,
    ...scores,
  });

  return NextResponse.json(
    {
      persisted,
      result: result ?? {
        id: `mt-${studentId}-${Date.now()}`,
        date,
        label,
        ...scores,
        overall: calcOverall(scores),
      },
    },
    { status: 201 }
  );
}
