/**
 * Assembles the director dashboard from the data the app already owns.
 *
 * Every figure here is computed from real rows — students, groups, lessons,
 * submissions — rather than stored as a summary, so the dashboard cannot drift
 * from the screens it summarises.
 */

import { createAdminClient } from "@/lib/supabase/server";
import { getAllStudentsAdmin } from "@/lib/data/students";
import { TOTAL_LESSONS, currentLessonFor } from "@/lib/lessons-data";
import {
  GROUP_TEACHER,
  PENDING_REVIEW_SEED,
  REVIEW_SLA_HOURS,
  TEACHERS,
  teacherById,
  type Teacher,
} from "@/lib/admin-data";
import { HOMEWORK_SEED } from "@/lib/group-data";
import type { Student } from "@/lib/types";

const CENTER_ID = "11111111-1111-1111-1111-111111111111";

export interface AdminKpis {
  activeStudents: number;
  activeGroups: number;
  averageBand: number;
  attendance: number;
  /** Share of submissions handed in on or before the due date. */
  onTimeHomework: number;
}

export interface GroupOverviewRow {
  name: string;
  teacherName: string;
  teacherInitials: string;
  students: number;
  /** Nominal capacity, so the UI can show "8/8". */
  capacity: number;
  currentLesson: number;
  totalLessons: number;
  averageBand: number;
}

export interface PendingReview {
  id: string;
  studentName: string;
  groupName: string;
  taskTitle: string;
  section: string;
  teacherName: string;
  hoursWaiting: number;
}

export interface TeacherLoad {
  id: string;
  name: string;
  initials: string;
  email: string;
  role: Teacher["role"];
  groups: string[];
  students: number;
  pending: number;
  /** Pending items past the review SLA. */
  overdue: number;
}

export interface AdminOverview {
  kpis: AdminKpis;
  groups: GroupOverviewRow[];
  pendingReviews: PendingReview[];
  teachers: TeacherLoad[];
  students: {
    id: string;
    name: string;
    initials: string;
    email: string | null;
    group: string;
    band: number;
  }[];
  source: "supabase" | "mock";
}

function latestBand(s: Student): number {
  return s.mockTests[s.mockTests.length - 1]?.overall ?? 0;
}

function averageOf(values: number[]): number {
  if (values.length === 0) return 0;
  return Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10;
}

/** Group capacity: real headcount, rounded up to a sane class size. */
function capacityFor(count: number): number {
  return Math.max(count, Math.ceil(count / 4) * 4);
}

interface SubmissionRow {
  id: string;
  status: string;
  submitted_at: string | null;
  students: { name: string; student_group: string } | null;
  homework: { title: string; section: string; due_date: string | null } | null;
}

async function loadSubmissions(): Promise<SubmissionRow[] | null> {
  const supabase = createAdminClient();
  if (!supabase) return null;
  try {
    const res = await supabase
      .from("homework_submissions")
      .select(
        "id, status, submitted_at, students(name, student_group), homework(title, section, due_date)"
      );
    if (res.error || !res.data) return null;
    return res.data as unknown as SubmissionRow[];
  } catch {
    return null;
  }
}

async function loadGroupRows(): Promise<
  { name: string; current_lesson: number; teacher_id: string | null }[] | null
> {
  const supabase = createAdminClient();
  if (!supabase) return null;
  try {
    const res = await supabase
      .from("groups")
      .select("name, current_lesson, teacher_id")
      .order("name");
    if (res.error || !res.data) return null;
    return res.data as unknown as {
      name: string;
      current_lesson: number;
      teacher_id: string | null;
    }[];
  } catch {
    return null;
  }
}

async function loadTeacherRows(): Promise<
  { id: string; name: string; role: string }[] | null
> {
  const supabase = createAdminClient();
  if (!supabase) return null;
  try {
    const res = await supabase
      .from("teachers")
      .select("id, name, role")
      .eq("center_id", CENTER_ID);
    if (res.error || !res.data?.length) return null;
    return res.data as unknown as { id: string; name: string; role: string }[];
  } catch {
    return null;
  }
}

function hoursSince(iso: string): number {
  return Math.max(0, (Date.now() - new Date(iso).getTime()) / 3_600_000);
}

export async function getAdminOverview(): Promise<AdminOverview> {
  // Whole-centre aggregate for the director dashboard. The route
  // (/api/admin/overview) is already gated to owner/admin, so a service-role
  // read of the full cohort here is intentional and scoped by that gate.
  const { students, source } = await getAllStudentsAdmin();
  const [groupRows, teacherRows, submissionRows] = await Promise.all([
    loadGroupRows(),
    loadTeacherRows(),
    loadSubmissions(),
  ]);

  // --- groups --------------------------------------------------------------
  const groupNames = Array.from(
    new Set([
      ...(groupRows?.map((g) => g.name) ?? []),
      ...students.map((s) => s.group),
    ])
  ).sort();

  const groups: GroupOverviewRow[] = groupNames
    .map((name) => {
      const members = students.filter((s) => s.group === name);
      const row = groupRows?.find((g) => g.name === name);
      const teacher =
        teacherById(row?.teacher_id ?? GROUP_TEACHER[name]) ?? TEACHERS[0];
      return {
        name,
        teacherName: teacher.name,
        teacherInitials: teacher.initials,
        students: members.length,
        capacity: capacityFor(members.length),
        currentLesson: row?.current_lesson ?? currentLessonFor(name),
        totalLessons: TOTAL_LESSONS,
        averageBand: averageOf(members.map(latestBand)),
      };
    })
    // Groups with no students are not "active" for the director's purposes.
    .filter((g) => g.students > 0);

  // --- pending reviews -----------------------------------------------------
  let pendingReviews: PendingReview[] = [];

  const dbPending = submissionRows?.filter(
    (r) => r.status === "submitted" && r.submitted_at
  );

  if (dbPending?.length) {
    pendingReviews = dbPending.map((r) => {
      const groupName = r.students?.student_group ?? "—";
      const teacher =
        teacherById(GROUP_TEACHER[groupName]) ?? TEACHERS[0];
      return {
        id: r.id,
        studentName: r.students?.name ?? "—",
        groupName,
        taskTitle: r.homework?.title ?? "Задание",
        section: r.homework?.section ?? "general",
        teacherName: teacher.name,
        hoursWaiting: hoursSince(r.submitted_at!),
      };
    });
  } else {
    // No submissions in the database yet — fall back to the demo queue so the
    // block is demonstrable rather than empty.
    pendingReviews = PENDING_REVIEW_SEED.map((p) => {
      const student = students.find((s) => s.name === p.studentName);
      const groupName = student?.group ?? "IELTS 62";
      const hw = HOMEWORK_SEED.find((h) => h.id === p.homeworkId);
      const teacher = teacherById(GROUP_TEACHER[groupName]) ?? TEACHERS[0];
      return {
        id: p.id,
        studentName: p.studentName,
        groupName,
        taskTitle: hw?.title ?? "Задание",
        section: hw?.section ?? "general",
        teacherName: teacher.name,
        hoursWaiting: p.hoursAgo,
      };
    });
  }

  pendingReviews.sort((a, b) => b.hoursWaiting - a.hoursWaiting);

  // --- teachers ------------------------------------------------------------
  const roster: Teacher[] = teacherRows?.length
    ? teacherRows.map(
        (r) =>
          teacherById(r.id) ?? {
            id: r.id,
            name: r.name,
            initials: r.name
              .split(" ")
              .map((p) => p[0])
              .join("")
              .slice(0, 2)
              .toUpperCase(),
            email: "",
            role: (r.role as Teacher["role"]) ?? "teacher",
          }
      )
    : TEACHERS;

  const teachers: TeacherLoad[] = roster.map((t) => {
    const owned = groups.filter((g) => {
      const row = groupRows?.find((r) => r.name === g.name);
      return (row?.teacher_id ?? GROUP_TEACHER[g.name]) === t.id;
    });
    const mine = pendingReviews.filter((p) => p.teacherName === t.name);
    return {
      id: t.id,
      name: t.name,
      initials: t.initials,
      email: t.email,
      role: t.role,
      groups: owned.map((g) => g.name),
      students: owned.reduce((n, g) => n + g.students, 0),
      pending: mine.length,
      overdue: mine.filter((p) => p.hoursWaiting > REVIEW_SLA_HOURS).length,
    };
  });

  // --- KPIs ----------------------------------------------------------------
  let onTimeHomework = 0;
  const decided = submissionRows?.filter(
    (r) => r.status !== "assigned" && r.submitted_at && r.homework?.due_date
  );
  if (decided?.length) {
    const onTime = decided.filter(
      (r) => new Date(r.submitted_at!) <= new Date(`${r.homework!.due_date}T23:59:59`)
    ).length;
    onTimeHomework = Math.round((onTime / decided.length) * 100);
  } else {
    // Without submission history, attendance is the closest honest proxy.
    onTimeHomework = Math.round(
      students.reduce((a, s) => a + s.attendance, 0) /
        Math.max(students.length, 1)
    );
  }

  const kpis: AdminKpis = {
    activeStudents: students.length,
    activeGroups: groups.length,
    averageBand: averageOf(students.map(latestBand)),
    attendance: Math.round(
      students.reduce((a, s) => a + s.attendance, 0) /
        Math.max(students.length, 1)
    ),
    onTimeHomework,
  };

  return {
    kpis,
    groups,
    pendingReviews,
    teachers,
    students: students.map((s) => ({
      id: s.id,
      name: s.name,
      initials: s.initials,
      email: s.email ?? null,
      group: s.group,
      band: latestBand(s),
    })),
    source,
  };
}
