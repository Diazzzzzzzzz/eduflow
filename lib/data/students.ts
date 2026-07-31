/**
 * Server-side data access for students and their nested mock tests +
 * recommendations.
 *
 * READS run through the caller's own session (createRlsClient), so Postgres
 * RLS — not this code — decides which rows come back: a student sees only their
 * own row, a parent only their wards, staff only their centre (migration 0011).
 * The one exception is the mock-data fallback used when Supabase is
 * unconfigured, which is scoped in code by `scopeStudentsForRole` to mirror the
 * same rules.
 *
 * SERVER ONLY.
 */
import type { MockTest, Recommendation, Student } from "@/lib/types";
import type { Role } from "@/lib/auth-routes";
import { STUDENTS } from "@/lib/mock-data";
import { calcOverall } from "@/lib/band";
import { DEMO_STUDENT_ID } from "@/lib/demo-session";
import { createRlsClient, type Session } from "@/lib/supabase/auth-server";
import { createAdminClient } from "@/lib/supabase/server";
import type {
  Database,
  MockTestRow,
  RecommendationRow,
  StudentRow,
} from "@/lib/supabase/types";

type StudentWithChildren = StudentRow & {
  mock_tests: MockTestRow[] | null;
  recommendations: RecommendationRow[] | null;
};

function mapMockTest(t: MockTestRow): MockTest {
  const scores = {
    listening: Number(t.listening),
    reading: Number(t.reading),
    writing: Number(t.writing),
    speaking: Number(t.speaking),
  };
  return {
    id: t.id,
    date: t.taken_on,
    label: t.label,
    ...scores,
    overall: t.overall != null ? Number(t.overall) : calcOverall(scores),
  };
}

function mapRecommendation(r: RecommendationRow): Recommendation {
  return {
    id: r.id,
    skill: r.skill,
    priority: r.priority,
    title: r.title,
    detail: r.detail,
  };
}

function mapStudent(row: StudentWithChildren): Student {
  return {
    id: row.id,
    name: row.name,
    initials: row.initials,
    group: row.student_group,
    targetBand: Number(row.target_band),
    examDate: row.exam_date ?? "",
    attendance: row.attendance,
    teacherNote: row.teacher_note ?? "",
    mockTests: (row.mock_tests ?? [])
      .map(mapMockTest)
      .sort((a, b) => a.date.localeCompare(b.date)),
    recommendations: (row.recommendations ?? []).map(mapRecommendation),
  };
}

/**
 * Pure scoping rule for the mock-data fallback (and the unit tests).
 *
 * Mirrors the RLS policies so the app behaves the same with or without a
 * database: a student sees only their own row; a parent only their wards; staff
 * see the whole cohort. Defaults to "nothing" for an unknown/absent role, so a
 * missing profile never leaks the cohort.
 */
export function scopeStudentsForRole(
  cohort: Student[],
  opts: { role: Role | undefined; studentId?: string | null; wardIds?: string[] }
): Student[] {
  const { role, studentId, wardIds = [] } = opts;
  switch (role) {
    case "owner":
    case "admin":
    case "teacher":
      return cohort;
    case "student":
      return cohort.filter((s) => s.id === studentId);
    case "parent":
      return cohort.filter((s) => wardIds.includes(s.id));
    default:
      return [];
  }
}

/** Group names a teacher is assigned to, via groups.teacher_id → their row. */
async function teacherGroupNames(
  supabase: NonNullable<ReturnType<typeof createRlsClient>>,
  userId: string
): Promise<string[] | null> {
  const teacher = await supabase
    .from("teachers")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();
  const teacherId = (teacher.data as { id: string } | null)?.id;
  if (!teacherId) return null;

  const groups = await supabase
    .from("groups")
    .select("name")
    .eq("teacher_id", teacherId);
  const rows = (groups.data as { name: string }[] | null) ?? [];
  return rows.map((g) => g.name);
}

/**
 * The cohort visible to the given session, read under RLS.
 *
 * Falls back to the (role-scoped) mock cohort when Supabase is unconfigured, so
 * the app always renders. `source` tells the caller which path served the data.
 */
export async function getStudentsForSession(
  session: Session
): Promise<{ students: Student[]; source: "supabase" | "mock" }> {
  const role = session.profile?.role;
  const studentId = session.profile?.student_id ?? null;
  const wardIds = role === "parent" && studentId ? [studentId] : [];

  // Demo sessions have no real Supabase JWT, so an RLS client would run as anon
  // and see nothing. Demo mode (dev-only, off in production) instead reads the
  // cohort via the admin path and scopes it in code with the same rule as RLS.
  const isDemo = session.user.id.startsWith("demo-");
  if (isDemo) {
    const { students: cohort, source } = await getAllStudentsAdmin();
    return {
      students: scopeStudentsForRole(cohort, { role, studentId, wardIds }),
      source,
    };
  }

  const supabase = createRlsClient();
  if (!supabase) {
    // No database configured: scope the bundled cohort the same way RLS would.
    return {
      students: scopeStudentsForRole(STUDENTS, { role, studentId, wardIds }),
      source: "mock",
    };
  }

  try {
    const { data, error } = await supabase
      .from("students")
      .select("*, mock_tests(*), recommendations(*)")
      .order("created_at", { ascending: true });

    if (error) {
      console.warn("[data/students] RLS query failed:", error.message);
      return { students: [], source: "supabase" };
    }

    let students = ((data as unknown as StudentWithChildren[]) ?? []).map(
      mapStudent
    );

    // Teachers: RLS limits them to their centre; narrow further to the groups
    // they actually run. String match because groups↔students are still linked
    // by name — real enrollment FKs are Stage 2. If a teacher has no assigned
    // groups we keep the centre-wide result rather than blanking the dashboard.
    if (role === "teacher") {
      const names = await teacherGroupNames(supabase, session.user.id);
      if (names && names.length > 0) {
        const allowed = new Set(names);
        students = students.filter((s) => allowed.has(s.group));
      }
    }

    return { students, source: "supabase" };
  } catch (err) {
    console.warn("[data/students] Unexpected error:", err);
    return { students: [], source: "supabase" };
  }
}

export interface NewMockResult {
  studentId: string;
  label: string;
  date: string;
  listening: number;
  reading: number;
  writing: number;
  speaking: number;
}

/**
 * Persists a mock result under the CALLER'S session, so RLS enforces that only
 * staff of the student's centre can write it — a student or parent session is
 * rejected by the policy, not by trust in this code. Returns persisted=false
 * when there's no database.
 */
export async function createMockResult(
  input: NewMockResult
): Promise<{ persisted: boolean; result?: MockTest; error?: string }> {
  const supabase = createRlsClient();
  if (!supabase) return { persisted: false };

  const payload: Database["public"]["Tables"]["mock_tests"]["Insert"] = {
    student_id: input.studentId,
    label: input.label,
    taken_on: input.date,
    listening: input.listening,
    reading: input.reading,
    writing: input.writing,
    speaking: input.speaking,
  };

  const { data, error } = await supabase
    .from("mock_tests")
    .insert(payload as never)
    .select()
    .single();

  if (error || !data) {
    // An RLS rejection lands here too — surface it so the route can 403.
    console.warn("[data/students] insert mock_test failed:", error?.message);
    return { persisted: false, error: error?.message };
  }
  return { persisted: true, result: mapMockTest(data as MockTestRow) };
}

export { DEMO_STUDENT_ID };

/**
 * SERVICE-ROLE cohort read — bypasses RLS. Retained ONLY for server-side
 * aggregates that legitimately span the whole centre before per-user scoping
 * applies (see lib/data/admin.ts) and for the seed. Never call from a
 * user-facing read path; use getStudentsForSession instead.
 */
export async function getAllStudentsAdmin(): Promise<{
  students: Student[];
  source: "supabase" | "mock";
}> {
  const supabase = createAdminClient();
  if (!supabase) return { students: STUDENTS, source: "mock" };
  try {
    const { data, error } = await supabase
      .from("students")
      .select("*, mock_tests(*), recommendations(*)")
      .order("created_at", { ascending: true });
    if (error || !data || data.length === 0) {
      return { students: STUDENTS, source: "mock" };
    }
    return {
      students: (data as unknown as StudentWithChildren[]).map(mapStudent),
      source: "supabase",
    };
  } catch {
    return { students: STUDENTS, source: "mock" };
  }
}
