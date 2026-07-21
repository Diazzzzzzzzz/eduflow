/**
 * Server-side data access for students and their nested mock tests +
 * recommendations. Reads from Supabase when a service-role key is configured,
 * otherwise falls back to the bundled mock cohort so the app always renders.
 *
 * SERVER ONLY — imports the service-role client. Do not import from a client
 * component; the client fetches this data through /api/students instead.
 */
import type { MockTest, Recommendation, Student } from "@/lib/types";
import { STUDENTS } from "@/lib/mock-data";
import { calcOverall } from "@/lib/band";
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
 * Returns the cohort with full history. Falls back to mock data whenever
 * Supabase is unconfigured or the query fails/returns nothing.
 */
export async function getStudents(): Promise<{ students: Student[]; source: "supabase" | "mock" }> {
  const supabase = createAdminClient();
  if (!supabase) return { students: STUDENTS, source: "mock" };

  try {
    const { data, error } = await supabase
      .from("students")
      .select("*, mock_tests(*), recommendations(*)")
      .order("created_at", { ascending: true });

    if (error) {
      console.warn("[data/students] Supabase query failed, using mock:", error.message);
      return { students: STUDENTS, source: "mock" };
    }
    if (!data || data.length === 0) {
      return { students: STUDENTS, source: "mock" };
    }
    return {
      students: (data as unknown as StudentWithChildren[]).map(mapStudent),
      source: "supabase",
    };
  } catch (err) {
    console.warn("[data/students] Unexpected error, using mock:", err);
    return { students: STUDENTS, source: "mock" };
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
 * Persists a mock result to Supabase when configured. Returns persisted=false
 * when there's no database, so the caller can still echo the computed result
 * (the client keeps a localStorage copy in that case).
 */
export async function createMockResult(
  input: NewMockResult
): Promise<{ persisted: boolean; result?: MockTest }> {
  const supabase = createAdminClient();
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
    // Cast: the hand-written Database generic doesn't fully narrow insert()'s
    // value type. Regenerate types with `supabase gen types typescript` to drop
    // this. Runtime shape is validated by `payload` above.
    .insert(payload as never)
    .select()
    .single();

  if (error || !data) {
    console.warn("[data/students] insert mock_test failed:", error?.message);
    return { persisted: false };
  }
  return { persisted: true, result: mapMockTest(data as MockTestRow) };
}
