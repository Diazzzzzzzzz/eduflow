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
import { REVIEW_SLA_HOURS, type Teacher } from "@/lib/admin-data";
import type { Student } from "@/lib/types";

const CENTER_ID = "11111111-1111-1111-1111-111111111111";

export interface AdminKpis {
  activeStudents: number;
  activeGroups: number;
  averageBand: number;
  attendance: number;
  /**
   * Share of submissions handed in on or before the due date, or null when
   * nothing has been handed in yet. Null rather than a stand-in figure: this
   * used to fall back to the attendance average, so the dashboard reported
   * attendance under a "homework on time" label.
   */
  onTimeHomework: number | null;
}

export interface GroupOverviewRow {
  name: string;
  teacherName: string;
  teacherInitials: string;
  students: number;
  /** Seats configured for the group; null when the centre hasn't set one. */
  capacity: number | null;
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

/** Initials for a staff member whose row carries only a full name. */
function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
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

interface GroupRow {
  name: string;
  current_lesson: number;
  teacher_id: string | null;
  capacity: number | null;
}

async function loadGroupRows(): Promise<GroupRow[] | null> {
  const supabase = createAdminClient();
  if (!supabase) return null;
  try {
    const res = await supabase
      .from("groups")
      .select("name, current_lesson, teacher_id, capacity")
      .order("name");
    if (res.error || !res.data) return null;
    return res.data as unknown as GroupRow[];
  } catch {
    return null;
  }
}

interface TeacherRow {
  id: string;
  name: string;
  role: string;
  email: string | null;
}

async function loadTeacherRows(): Promise<TeacherRow[] | null> {
  const supabase = createAdminClient();
  if (!supabase) return null;
  try {
    const res = await supabase
      .from("teachers")
      .select("id, name, role, email")
      .eq("center_id", CENTER_ID);
    if (res.error || !res.data?.length) return null;
    return res.data as unknown as TeacherRow[];
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

  // Staff, keyed by id. The database is the only source: the old code looked
  // names up in a bundled TEACHERS list first, so a real row could be
  // displayed under a mock person's name.
  const staffById = new Map<string, TeacherRow>(
    (teacherRows ?? []).map((t) => [t.id, t])
  );

  // --- groups --------------------------------------------------------------
  const groupNames = Array.from(
    new Set([
      ...(groupRows?.map((g) => g.name) ?? []),
      ...students.map((s) => s.group),
    ])
  ).sort();

  /** Which staff member runs a group, straight from groups.teacher_id. */
  const teacherOfGroup = new Map<string, TeacherRow | undefined>(
    groupNames.map((name) => {
      const row = groupRows?.find((g) => g.name === name);
      return [name, row?.teacher_id ? staffById.get(row.teacher_id) : undefined];
    })
  );

  const groups: GroupOverviewRow[] = groupNames
    .map((name) => {
      const members = students.filter((s) => s.group === name);
      const row = groupRows?.find((g) => g.name === name);
      const teacher = teacherOfGroup.get(name);
      return {
        name,
        // An unassigned group says so rather than borrowing someone's name.
        teacherName: teacher?.name ?? "Не назначен",
        teacherInitials: teacher ? initialsOf(teacher.name) : "—",
        students: members.length,
        capacity: row?.capacity ?? null,
        currentLesson: row?.current_lesson ?? currentLessonFor(name),
        totalLessons: TOTAL_LESSONS,
        averageBand: averageOf(members.map(latestBand)),
      };
    })
    // Groups with no students are not "active" for the director's purposes.
    .filter((g) => g.students > 0);

  // --- pending reviews -----------------------------------------------------
  // Real queue only. This used to substitute a bundled demo queue whenever the
  // database returned nothing, so a director could be shown work waiting on
  // teachers that nobody had actually handed in. An empty queue is a fact
  // worth reporting.
  const pendingReviews: PendingReview[] = (submissionRows ?? [])
    .filter((r) => r.status === "submitted" && r.submitted_at)
    .map((r) => {
      const groupName = r.students?.student_group ?? "—";
      const teacher = teacherOfGroup.get(groupName);
      return {
        id: r.id,
        studentName: r.students?.name ?? "—",
        groupName,
        taskTitle: r.homework?.title ?? "Задание",
        section: r.homework?.section ?? "general",
        teacherName: teacher?.name ?? "Не назначен",
        hoursWaiting: hoursSince(r.submitted_at!),
      };
    });

  pendingReviews.sort((a, b) => b.hoursWaiting - a.hoursWaiting);

  // --- teachers ------------------------------------------------------------
  // Straight from public.teachers; no bundled roster to fall back on.
  const teachers: TeacherLoad[] = (teacherRows ?? []).map((t) => {
    const owned = groups.filter((g) => {
      const row = groupRows?.find((r) => r.name === g.name);
      return row?.teacher_id === t.id;
    });
    const mine = pendingReviews.filter((p) => p.groupName !== "—" &&
      teacherOfGroup.get(p.groupName)?.id === t.id);
    return {
      id: t.id,
      name: t.name,
      initials: initialsOf(t.name),
      email: t.email ?? "",
      role: (t.role as Teacher["role"]) ?? "teacher",
      groups: owned.map((g) => g.name),
      students: owned.reduce((n, g) => n + g.students, 0),
      pending: mine.length,
      overdue: mine.filter((p) => p.hoursWaiting > REVIEW_SLA_HOURS).length,
    };
  });

  // --- KPIs ----------------------------------------------------------------
  // Null when nothing has been handed in: the previous version substituted the
  // attendance average here, presenting one metric under another's label.
  const decided = (submissionRows ?? []).filter(
    (r) => r.status !== "assigned" && r.submitted_at && r.homework?.due_date
  );
  const onTimeHomework = decided.length
    ? Math.round(
        (decided.filter(
          (r) =>
            new Date(r.submitted_at!) <=
            new Date(`${r.homework!.due_date}T23:59:59`)
        ).length /
          decided.length) *
          100
      )
    : null;

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
