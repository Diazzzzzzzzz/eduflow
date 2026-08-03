/**
 * Per-teacher analytics for the director dashboard.
 *
 * Answers "how is this teacher's cohort doing": their groups, the students in
 * them, the band those students are averaging, attendance, and how much of the
 * homework they set has actually been marked.
 *
 * Reads through the service-role client, like the rest of lib/data/admin.ts:
 * this is a whole-centre aggregate that a director is entitled to see across
 * every group, which is exactly what RLS would narrow. The API route is the
 * access boundary and checks `canAccessAdmin` before calling in.
 *
 * SERVER ONLY.
 */
import { createAdminClient } from "@/lib/supabase/server";
import { STUDENTS } from "@/lib/mock-data";
import {
  GROUP_TEACHER,
  TEACHERS,
  type StaffRole,
  teacherById,
} from "@/lib/admin-data";
import { GROUP_SCHEDULES, HOMEWORK_SEED, buildSubmissionSeed } from "@/lib/group-data";
import { calcOverall } from "@/lib/band";

const CENTER_ID = "11111111-1111-1111-1111-111111111111";

/** Review SLA is shared with the overview; kept local to avoid a cycle. */
export interface TeacherGroupSummary {
  name: string;
  schedule: string | null;
  students: number;
}

export interface TeacherStudentRow {
  id: string;
  name: string;
  initials: string;
  group: string;
  /** Latest mock band, or null when they have never sat one. */
  band: number | null;
  /** First mock band; null when they have never sat one. */
  startingBand: number | null;
  /** Change from their first mock to their latest; null with fewer than two. */
  delta: number | null;
  attendance: number;
}

/**
 * How far the cohort has moved, not just where it stands.
 *
 * A current average alone cannot tell a teacher who inherited a strong group
 * from one who lifted a weak one, which is the more useful thing for a
 * director to see.
 *
 * `from`, `to` and `delta` are all computed over the SAME subset — students
 * with at least two mocks — so `from + delta === to` exactly. Mixing subsets
 * would produce a headline gain that its own two endpoints contradict.
 */
export interface TeacherProgress {
  /** Students progress could be measured on (two or more mocks). */
  measured: number;
  /** Mean first-mock band across those students. */
  from: number;
  /** Mean latest band across those students. */
  to: number;
  /** Mean gain, `to - from`. */
  delta: number;
  improved: number;
  declined: number;
  unchanged: number;
}

export interface TeacherHomeworkStats {
  /** Distinct tasks the teacher has set. */
  tasks: number;
  /** Rows across those tasks — one per student per task. */
  total: number;
  graded: number;
  awaitingReview: number;
  notSubmitted: number;
  /** Mean band across graded work; null when nothing is graded yet. */
  averageBand: number | null;
}

export interface TeacherKpis {
  /** Mean latest band across the teacher's students; null without results. */
  averageBand: number | null;
  /** Mean attendance percentage; null without students. */
  attendance: number | null;
  /** Share of handed-in work that has been marked, 0–100; null if none. */
  reviewedRate: number | null;
  /** Movement since each student's first mock; null when nobody has two. */
  progress: TeacherProgress | null;
}

export interface TeacherAnalytics {
  teacher: {
    id: string;
    name: string;
    initials: string;
    email: string;
    role: StaffRole;
  };
  groups: TeacherGroupSummary[];
  studentCount: number;
  kpis: TeacherKpis;
  students: TeacherStudentRow[];
  homework: TeacherHomeworkStats;
  source: "supabase" | "mock";
}

function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function mean(values: number[]): number | null {
  if (values.length === 0) return null;
  return Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10;
}

function percent(part: number, whole: number): number | null {
  if (whole <= 0) return null;
  return Math.round((part / whole) * 100);
}

/** Attendance is a percentage — a whole number, not a band with a decimal. */
function meanPercent(values: number[]): number | null {
  if (values.length === 0) return null;
  return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
}

/**
 * Cohort movement, over the students who have sat at least two mocks.
 *
 * Shared by the live and demo paths so the two cannot drift apart. `delta` is
 * derived from the rounded `from` and `to` rather than averaged separately, so
 * the three figures always reconcile on screen.
 */
function computeProgress(students: TeacherStudentRow[]): TeacherProgress | null {
  const measured = students.filter(
    (s) => s.band != null && s.startingBand != null && s.delta != null
  );
  if (measured.length === 0) return null;

  const from = mean(measured.map((s) => s.startingBand!))!;
  const to = mean(measured.map((s) => s.band!))!;
  return {
    measured: measured.length,
    from,
    to,
    delta: Math.round((to - from) * 10) / 10,
    improved: measured.filter((s) => s.delta! > 0).length,
    declined: measured.filter((s) => s.delta! < 0).length,
    unchanged: measured.filter((s) => s.delta! === 0).length,
  };
}

/* -------------------------------------------------------------------------- */
/* Demo                                                                       */
/* -------------------------------------------------------------------------- */

/**
 * Analytics assembled from the bundled fixtures.
 *
 * A demo session never touches the centre's database, so the showcase has to
 * derive the same shape from lib/mock-data + lib/group-data. The numbers are
 * computed from those fixtures rather than invented, so the panel adds up:
 * the student list, the averages and the homework counts all agree.
 */
export function demoTeacherAnalytics(teacherId: string): TeacherAnalytics | null {
  const teacher = teacherById(teacherId) ?? TEACHERS.find((t) => t.id === teacherId);
  if (!teacher) return null;

  const groupNames = Object.entries(GROUP_TEACHER)
    .filter(([, id]) => id === teacher.id)
    .map(([name]) => name);

  const cohort = STUDENTS.filter((s) => groupNames.includes(s.group));

  const students: TeacherStudentRow[] = cohort.map((s) => {
    const first = s.mockTests[0];
    const last = s.mockTests[s.mockTests.length - 1];
    return {
      id: s.id,
      name: s.name,
      initials: s.initials,
      group: s.group,
      band: last?.overall ?? null,
      startingBand: first?.overall ?? null,
      delta:
        first && last && s.mockTests.length > 1
          ? Math.round((last.overall - first.overall) * 10) / 10
          : null,
      attendance: s.attendance,
    };
  });

  const tasks = HOMEWORK_SEED.filter((h) => groupNames.includes(h.groupName));
  const taskIds = new Set(tasks.map((h) => h.id));
  const subs = buildSubmissionSeed().filter((s) => taskIds.has(s.homeworkId));

  const graded = subs.filter((s) => s.status === "graded");
  const awaiting = subs.filter((s) => s.status === "submitted");
  const notSubmitted = subs.filter((s) => s.status === "assigned");
  const handedIn = graded.length + awaiting.length;

  return {
    teacher: {
      id: teacher.id,
      name: teacher.name,
      initials: initialsOf(teacher.name),
      email: teacher.email ?? "",
      role: teacher.role,
    },
    groups: groupNames.map((name) => ({
      name,
      schedule: GROUP_SCHEDULES[name] ?? null,
      students: cohort.filter((s) => s.group === name).length,
    })),
    studentCount: cohort.length,
    kpis: {
      averageBand: mean(
        students.map((s) => s.band).filter((b): b is number => b != null)
      ),
      attendance: meanPercent(students.map((s) => s.attendance)),
      reviewedRate: percent(graded.length, handedIn),
      progress: computeProgress(students),
    },
    students: students.sort((a, b) => (b.band ?? 0) - (a.band ?? 0)),
    homework: {
      tasks: tasks.length,
      total: subs.length,
      graded: graded.length,
      awaitingReview: awaiting.length,
      notSubmitted: notSubmitted.length,
      averageBand: mean(
        graded.map((s) => s.band).filter((b): b is number => b != null)
      ),
    },
    source: "mock",
  };
}

/* -------------------------------------------------------------------------- */
/* Live                                                                       */
/* -------------------------------------------------------------------------- */

interface TeacherRow {
  id: string;
  name: string;
  role: string;
  email: string | null;
}

interface GroupRow {
  id: string;
  name: string;
  schedule: string | null;
  teacher_id: string | null;
}

interface StudentRow {
  id: string;
  name: string;
  initials: string;
  student_group: string;
  attendance: number;
  mock_tests:
    | {
        taken_on: string;
        overall: number | string | null;
        listening: number | string;
        reading: number | string;
        writing: number | string;
        speaking: number | string;
      }[]
    | null;
}

interface HomeworkRow {
  id: string;
  group_name: string;
}

interface SubmissionRow {
  homework_id: string;
  status: string;
  band_score: number | string | null;
}

/**
 * Live analytics for one teacher.
 *
 * Returns null when the teacher does not exist, so the route can 404 rather
 * than render an empty panel that looks like a teacher with no work.
 */
export async function getTeacherAnalytics(
  teacherId: string
): Promise<TeacherAnalytics | null> {
  const supabase = createAdminClient();
  if (!supabase) return null;

  const teacherRes = await supabase
    .from("teachers")
    .select("id, name, role, email")
    .eq("id", teacherId)
    .eq("center_id", CENTER_ID)
    .maybeSingle();

  const teacher = teacherRes.data as unknown as TeacherRow | null;
  if (teacherRes.error || !teacher) return null;

  // --- groups this teacher runs -------------------------------------------
  const groupsRes = await supabase
    .from("groups")
    .select("id, name, schedule, teacher_id")
    .eq("teacher_id", teacherId);
  const groupRows = ((groupsRes.data as unknown as GroupRow[]) ?? []).filter(
    (g) => g.teacher_id === teacherId
  );
  const groupNames = groupRows.map((g) => g.name);

  const empty: TeacherAnalytics = {
    teacher: {
      id: teacher.id,
      name: teacher.name,
      initials: initialsOf(teacher.name),
      email: teacher.email ?? "",
      role: (teacher.role as StaffRole) ?? "teacher",
      },
    groups: [],
    studentCount: 0,
    kpis: {
      averageBand: null,
      attendance: null,
      reviewedRate: null,
      progress: null,
    },
    students: [],
    homework: {
      tasks: 0,
      total: 0,
      graded: 0,
      awaitingReview: 0,
      notSubmitted: 0,
      averageBand: null,
    },
    source: "supabase",
  };

  if (groupNames.length === 0) return empty;

  // --- students in those groups -------------------------------------------
  // Groups and students are still linked by name (the text mirror kept by
  // migration 0012), so this matches how the rest of lib/data reads them.
  const studentsRes = await supabase
    .from("students")
    .select(
      "id, name, initials, student_group, attendance, mock_tests(taken_on, overall, listening, reading, writing, speaking)"
    )
    .in("student_group", groupNames);
  const studentRows = (studentsRes.data as unknown as StudentRow[]) ?? [];

  const students: TeacherStudentRow[] = studentRows.map((s) => {
    const tests = [...(s.mock_tests ?? [])].sort((a, b) =>
      a.taken_on.localeCompare(b.taken_on)
    );
    const bandOf = (t: (typeof tests)[number]) =>
      t.overall != null
        ? Number(t.overall)
        : calcOverall({
            listening: Number(t.listening),
            reading: Number(t.reading),
            writing: Number(t.writing),
            speaking: Number(t.speaking),
          });
    const first = tests[0];
    const last = tests[tests.length - 1];
    return {
      id: s.id,
      name: s.name,
      initials: s.initials,
      group: s.student_group,
      band: last ? bandOf(last) : null,
      startingBand: first ? bandOf(first) : null,
      delta:
        tests.length > 1
          ? Math.round((bandOf(last) - bandOf(first)) * 10) / 10
          : null,
      attendance: s.attendance ?? 0,
    };
  });

  // --- homework set for those groups --------------------------------------
  const homeworkRes = await supabase
    .from("homework")
    .select("id, group_name")
    .in("group_name", groupNames);
  const homeworkRows = (homeworkRes.data as unknown as HomeworkRow[]) ?? [];
  const homeworkIds = homeworkRows.map((h) => h.id);

  let subs: SubmissionRow[] = [];
  if (homeworkIds.length > 0) {
    const subsRes = await supabase
      .from("homework_submissions")
      .select("homework_id, status, band_score")
      .in("homework_id", homeworkIds);
    subs = (subsRes.data as unknown as SubmissionRow[]) ?? [];
  }

  const graded = subs.filter((s) => s.status === "graded");
  const awaiting = subs.filter((s) => s.status === "submitted");
  const notSubmitted = subs.filter((s) => s.status === "assigned");
  const handedIn = graded.length + awaiting.length;

  return {
    teacher: {
      id: teacher.id,
      name: teacher.name,
      initials: initialsOf(teacher.name),
      email: teacher.email ?? "",
      role: (teacher.role as StaffRole) ?? "teacher",
    },
    groups: groupRows.map((g) => ({
      name: g.name,
      schedule: g.schedule,
      students: students.filter((s) => s.group === g.name).length,
    })),
    studentCount: students.length,
    kpis: {
      averageBand: mean(
        students.map((s) => s.band).filter((b): b is number => b != null)
      ),
      attendance: meanPercent(students.map((s) => s.attendance)),
      // Of the work actually handed in — counting never-submitted rows here
      // would blame the teacher for the students' backlog.
      reviewedRate: percent(graded.length, handedIn),
      progress: computeProgress(students),
    },
    students: students.sort((a, b) => (b.band ?? 0) - (a.band ?? 0)),
    homework: {
      tasks: homeworkRows.length,
      total: subs.length,
      graded: graded.length,
      awaitingReview: awaiting.length,
      notSubmitted: notSubmitted.length,
      averageBand: mean(
        graded
          .map((s) => (s.band_score == null ? null : Number(s.band_score)))
          .filter((b): b is number => b != null)
      ),
    },
    source: "supabase",
  };
}
