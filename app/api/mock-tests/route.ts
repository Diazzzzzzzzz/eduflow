import { NextResponse } from "next/server";
import { calcOverall } from "@/lib/band";
import { createMockResult } from "@/lib/data/students";
import { requireSession } from "@/lib/supabase/auth-server";
import { isStaff } from "@/lib/auth-routes";
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
  // Only staff record a student's result. RLS additionally rejects writing to a
  // student outside the caller's centre, so a teacher cannot fabricate a result
  // for someone else's student even with a valid session.
  const gate = await requireSession();
  if ("error" in gate) {
    return NextResponse.json({ error: gate.error }, { status: gate.status });
  }
  if (!isStaff(gate.session.profile?.role)) {
    return NextResponse.json(
      { error: "Только преподаватель или директор может выставлять результат." },
      { status: 403 }
    );
  }

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

  const { persisted, result, error } = await createMockResult({
    studentId,
    label,
    date,
    ...scores,
  });

  // A configured database that refused the write means RLS rejected the target
  // student (not in the caller's centre) — report it as forbidden.
  if (!persisted && error) {
    return NextResponse.json(
      { error: "Нет доступа к этому студенту." },
      { status: 403 }
    );
  }

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
