/**
 * Stage 2 — academic structure: courses, groups, enrollment, guardianship.
 *
 * Everything here runs under the caller's session, so RLS (migration 0012)
 * decides what is visible and what may be written: staff act within their
 * centre, a student/parent only reads their own group. No service-role.
 *
 * SERVER ONLY.
 */
import { createRlsClient } from "@/lib/supabase/auth-server";

export interface GroupSummary {
  id: string;
  name: string;
  schedule: string | null;
  currentLesson: number;
  teacherId: string | null;
  teacherName: string | null;
  courseId: string | null;
  courseName: string | null;
  studentCount: number;
}

export interface CourseSummary {
  id: string;
  name: string;
  description: string | null;
  totalLessons: number;
}

export interface EnrollmentRow {
  id: string;
  studentId: string;
  studentName: string;
  groupId: string;
  groupName: string;
  status: "active" | "completed" | "withdrawn";
  enrolledOn: string;
}

type GroupQueryRow = {
  id: string;
  name: string;
  schedule: string | null;
  current_lesson: number | null;
  teacher_id: string | null;
  course_id: string | null;
  teachers: { name: string } | null;
  courses: { name: string } | null;
  enrollments: { id: string }[] | null;
};

/** Groups visible to the caller, with teacher, course and headcount. */
export async function listGroups(): Promise<GroupSummary[]> {
  const supabase = createRlsClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("groups")
    .select(
      "id, name, schedule, current_lesson, teacher_id, course_id, teachers(name), courses(name), enrollments(id)"
    )
    .order("name");

  if (error || !data) {
    if (error) console.warn("[data/academic] listGroups:", error.message);
    return [];
  }

  return (data as unknown as GroupQueryRow[]).map((g) => ({
    id: g.id,
    name: g.name,
    schedule: g.schedule,
    currentLesson: g.current_lesson ?? 1,
    teacherId: g.teacher_id,
    teacherName: g.teachers?.name ?? null,
    courseId: g.course_id,
    courseName: g.courses?.name ?? null,
    studentCount: (g.enrollments ?? []).length,
  }));
}

export async function listCourses(): Promise<CourseSummary[]> {
  const supabase = createRlsClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("courses")
    .select("id, name, description, total_lessons")
    .order("name");
  if (error || !data) return [];
  return (
    data as unknown as {
      id: string;
      name: string;
      description: string | null;
      total_lessons: number;
    }[]
  ).map((c) => ({
    id: c.id,
    name: c.name,
    description: c.description,
    totalLessons: c.total_lessons,
  }));
}

/** Enrollments for one group, or all visible ones when groupId is omitted. */
export async function listEnrollments(
  groupId?: string
): Promise<EnrollmentRow[]> {
  const supabase = createRlsClient();
  if (!supabase) return [];

  let query = supabase
    .from("enrollments")
    .select("id, student_id, group_id, status, enrolled_on, students(name), groups(name)");
  if (groupId) query = query.eq("group_id", groupId);

  const { data, error } = await query;
  if (error || !data) {
    if (error) console.warn("[data/academic] listEnrollments:", error.message);
    return [];
  }

  return (
    data as unknown as {
      id: string;
      student_id: string;
      group_id: string;
      status: EnrollmentRow["status"];
      enrolled_on: string;
      students: { name: string } | null;
      groups: { name: string } | null;
    }[]
  ).map((e) => ({
    id: e.id,
    studentId: e.student_id,
    studentName: e.students?.name ?? "—",
    groupId: e.group_id,
    groupName: e.groups?.name ?? "—",
    status: e.status,
    enrolledOn: e.enrolled_on,
  }));
}

export interface MutationResult {
  ok: boolean;
  error?: string;
}

/**
 * Move a student into a group. Writing students.group_id is enough: the
 * triggers from 0012 mirror the legacy name column and create the enrollment
 * row. RLS rejects a student outside the caller's centre.
 */
export async function enrollStudent(
  studentId: string,
  groupId: string
): Promise<MutationResult> {
  const supabase = createRlsClient();
  if (!supabase) return { ok: false, error: "База данных не настроена." };

  const { error } = await supabase
    .from("students")
    .update({ group_id: groupId } as never)
    .eq("id", studentId)
    .select("id")
    .maybeSingle();

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

/** Mark an enrollment withdrawn/completed without deleting the history. */
export async function setEnrollmentStatus(
  enrollmentId: string,
  status: EnrollmentRow["status"]
): Promise<MutationResult> {
  const supabase = createRlsClient();
  if (!supabase) return { ok: false, error: "База данных не настроена." };
  const { error } = await supabase
    .from("enrollments")
    .update({ status } as never)
    .eq("id", enrollmentId);
  return error ? { ok: false, error: error.message } : { ok: true };
}

/** Assign (or clear, with null) the teacher who runs a group. */
export async function assignTeacher(
  groupId: string,
  teacherId: string | null
): Promise<MutationResult> {
  const supabase = createRlsClient();
  if (!supabase) return { ok: false, error: "База данных не настроена." };
  const { error } = await supabase
    .from("groups")
    .update({ teacher_id: teacherId } as never)
    .eq("id", groupId);
  return error ? { ok: false, error: error.message } : { ok: true };
}

/** Point a group at a course (which syllabus it follows). */
export async function assignCourse(
  groupId: string,
  courseId: string | null
): Promise<MutationResult> {
  const supabase = createRlsClient();
  if (!supabase) return { ok: false, error: "База данных не настроена." };
  const { error } = await supabase
    .from("groups")
    .update({ course_id: courseId } as never)
    .eq("id", groupId);
  return error ? { ok: false, error: error.message } : { ok: true };
}

export interface GuardianLink {
  id: string;
  parentUserId: string;
  studentId: string;
  studentName: string;
}

/** Parent↔child links visible to the caller. */
export async function listGuardianships(): Promise<GuardianLink[]> {
  const supabase = createRlsClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("guardianships")
    .select("id, parent_user_id, student_id, students(name)");
  if (error || !data) return [];
  return (
    data as unknown as {
      id: string;
      parent_user_id: string;
      student_id: string;
      students: { name: string } | null;
    }[]
  ).map((g) => ({
    id: g.id,
    parentUserId: g.parent_user_id,
    studentId: g.student_id,
    studentName: g.students?.name ?? "—",
  }));
}
