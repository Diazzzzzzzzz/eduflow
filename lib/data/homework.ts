/**
 * Stage 3a — the homework lifecycle: assign → submit → grade.
 *
 * Everything runs under the caller's session, so RLS (migration 0013) decides
 * visibility: staff see their centre, a student sees the work set for their
 * group and only their own submissions, a parent sees their wards'. Column-level
 * protection (a student cannot write a band or feedback) is enforced by a
 * database trigger, not by this code.
 *
 * SERVER ONLY.
 */
import { createRlsClient } from "@/lib/supabase/auth-server";
import type {
  Homework,
  HomeworkSection,
  Submission,
  SubmissionStatus,
  WritingCriteria,
} from "@/lib/group-data";

type HomeworkRow = {
  id: string;
  group_name: string;
  group_id: string | null;
  title: string;
  description: string | null;
  section: HomeworkSection;
  due_date: string | null;
  min_words: number | null;
  created_at: string;
};

type SubmissionRow = {
  id: string;
  homework_id: string;
  student_id: string;
  content: string | null;
  status: SubmissionStatus;
  band_score: number | string | null;
  feedback: string | null;
  criteria: WritingCriteria | null;
  submitted_at: string | null;
};

function mapHomework(r: HomeworkRow): Homework {
  return {
    id: r.id,
    groupName: r.group_name,
    title: r.title,
    description: r.description ?? "",
    section: r.section,
    dueDate: r.due_date ?? "",
    createdAt: r.created_at.slice(0, 10),
    minWords: r.min_words ?? undefined,
  };
}

function mapSubmission(r: SubmissionRow): Submission {
  return {
    id: r.id,
    homeworkId: r.homework_id,
    studentId: r.student_id,
    content: r.content ?? "",
    status: r.status,
    band: r.band_score == null ? null : Number(r.band_score),
    feedback: r.feedback,
    submittedAt: r.submitted_at ? r.submitted_at.slice(0, 10) : null,
    criteria: r.criteria ?? null,
  };
}

/** Homework + submissions the caller may see, optionally narrowed to a group. */
export async function getHomeworkBoard(groupName?: string): Promise<{
  homework: Homework[];
  submissions: Submission[];
}> {
  const supabase = createRlsClient();
  if (!supabase) return { homework: [], submissions: [] };

  let hwQuery = supabase
    .from("homework")
    .select(
      "id, group_name, group_id, title, description, section, due_date, min_words, created_at"
    )
    .order("created_at", { ascending: false });
  if (groupName) hwQuery = hwQuery.eq("group_name", groupName);

  const { data: hwData, error: hwError } = await hwQuery;
  if (hwError) {
    console.warn("[data/homework] list:", hwError.message);
    return { homework: [], submissions: [] };
  }
  const homework = ((hwData as unknown as HomeworkRow[]) ?? []).map(mapHomework);
  if (homework.length === 0) return { homework: [], submissions: [] };

  const { data: subData, error: subError } = await supabase
    .from("homework_submissions")
    .select(
      "id, homework_id, student_id, content, status, band_score, feedback, criteria, submitted_at"
    )
    .in(
      "homework_id",
      homework.map((h) => h.id)
    );

  if (subError) {
    console.warn("[data/homework] submissions:", subError.message);
    return { homework, submissions: [] };
  }

  return {
    homework,
    submissions: ((subData as unknown as SubmissionRow[]) ?? []).map(mapSubmission),
  };
}

export interface NewHomeworkInput {
  groupName: string;
  title: string;
  description: string;
  section: HomeworkSection;
  dueDate: string;
  minWords?: number;
  /** Assign to these students only; otherwise everyone enrolled in the group. */
  assignToStudentIds?: string[];
}

export interface MutationResult {
  ok: boolean;
  error?: string;
}

/**
 * Create a homework task and the per-student rows that represent the
 * assignment. Recipients are resolved from `enrollments` (Stage 2), so an
 * individual assignment cannot reach a student outside the group.
 */
export async function createHomework(
  input: NewHomeworkInput,
  createdBy: string
): Promise<MutationResult & { homeworkId?: string }> {
  const supabase = createRlsClient();
  if (!supabase) return { ok: false, error: "База данных не настроена." };

  const group = await supabase
    .from("groups")
    .select("id")
    .eq("name", input.groupName)
    .maybeSingle();
  const groupId = (group.data as { id: string } | null)?.id;
  if (!groupId) return { ok: false, error: "Группа не найдена." };

  const { data: hwRow, error: hwError } = await supabase
    .from("homework")
    .insert({
      group_id: groupId,
      group_name: input.groupName,
      title: input.title,
      description: input.description,
      section: input.section,
      due_date: input.dueDate || null,
      min_words: input.minWords ?? null,
      created_by: createdBy,
    } as never)
    .select("id")
    .single();

  if (hwError || !hwRow) {
    return { ok: false, error: hwError?.message ?? "Не удалось создать задание." };
  }
  const homeworkId = (hwRow as { id: string }).id;

  // Recipients: the group's active enrollment, narrowed if specific students
  // were named. Reading through RLS means a foreign student simply is not here.
  const enrolled = await supabase
    .from("enrollments")
    .select("student_id")
    .eq("group_id", groupId)
    .eq("status", "active");

  let targets = ((enrolled.data as { student_id: string }[] | null) ?? []).map(
    (e) => e.student_id
  );
  if (input.assignToStudentIds?.length) {
    const wanted = new Set(input.assignToStudentIds);
    targets = targets.filter((id) => wanted.has(id));
  }

  if (targets.length > 0) {
    const { error } = await supabase.from("homework_submissions").insert(
      targets.map((studentId) => ({
        homework_id: homeworkId,
        student_id: studentId,
        status: "assigned" as const,
      })) as never
    );
    if (error) return { ok: false, error: error.message };
  }

  return { ok: true, homeworkId };
}

/**
 * A student hands in their work. The submission row is located by (homework,
 * student) where student comes from the SESSION, so one student cannot submit
 * as another; RLS enforces the same thing again at the row level.
 */
export async function submitHomework(
  homeworkId: string,
  studentId: string,
  content: string
): Promise<MutationResult> {
  const supabase = createRlsClient();
  if (!supabase) return { ok: false, error: "База данных не настроена." };

  const { data, error } = await supabase
    .from("homework_submissions")
    .update({
      content,
      status: "submitted",
      submitted_at: new Date().toISOString(),
    } as never)
    .eq("homework_id", homeworkId)
    .eq("student_id", studentId)
    .select("id");

  if (error) return { ok: false, error: error.message };
  if (!data || (data as unknown[]).length === 0) {
    return { ok: false, error: "Это задание вам не назначено." };
  }
  return { ok: true };
}

/** Staff record a band and feedback. The trigger blocks students outright. */
export async function gradeSubmission(
  submissionId: string,
  band: number,
  feedback: string,
  criteria: WritingCriteria | null,
  gradedBy: string
): Promise<MutationResult> {
  const supabase = createRlsClient();
  if (!supabase) return { ok: false, error: "База данных не настроена." };

  const { data, error } = await supabase
    .from("homework_submissions")
    .update({
      band_score: band,
      feedback,
      criteria,
      status: "graded",
      graded_by: gradedBy,
      graded_at: new Date().toISOString(),
    } as never)
    .eq("id", submissionId)
    .select("id");

  if (error) return { ok: false, error: error.message };
  if (!data || (data as unknown[]).length === 0) {
    return { ok: false, error: "Работа не найдена или недоступна." };
  }
  return { ok: true };
}
