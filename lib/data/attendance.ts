/**
 * Stage 3b — attendance, read and written under the caller's session.
 *
 * RLS (migrations 0004 + 0014) does the enforcement: staff mark and read
 * within their centre, a student/parent reads the student's own rows, nobody
 * else writes. The database triggers attach the class session and recompute
 * the roster percentage; this module never does either by hand.
 *
 * SERVER ONLY.
 */
import { createRlsClient } from "@/lib/supabase/auth-server";
import type { AttendanceStatus } from "@/lib/group-data";

export interface AttendanceMark {
  studentId: string;
  date: string; // ISO date
  status: AttendanceStatus;
}

/** Marks visible to the caller, newest window first. */
export async function listAttendance(opts?: {
  groupName?: string;
  limit?: number;
}): Promise<AttendanceMark[]> {
  const supabase = createRlsClient();
  if (!supabase) return [];

  let query = supabase
    .from("attendance")
    .select("student_id, date, status")
    .order("date", { ascending: false })
    .limit(opts?.limit ?? 500);
  if (opts?.groupName) query = query.eq("group_name", opts.groupName);

  const { data, error } = await query;
  if (error) {
    console.warn("[data/attendance] list:", error.message);
    return [];
  }
  return (
    (data as unknown as { student_id: string; date: string; status: AttendanceStatus }[]) ??
    []
  ).map((r) => ({ studentId: r.student_id, date: r.date, status: r.status }));
}

export interface MutationResult {
  ok: boolean;
  error?: string;
}

/**
 * Record one student's mark for a date. The group comes from the student's own
 * enrollment (read under RLS) — the client never names it, so a mark cannot be
 * attached to a foreign group. Upsert: re-marking the same day corrects it.
 */
export async function markAttendance(
  studentId: string,
  date: string,
  status: AttendanceStatus,
  markedBy: string
): Promise<MutationResult> {
  const supabase = createRlsClient();
  if (!supabase) return { ok: false, error: "База данных не настроена." };

  const student = await supabase
    .from("students")
    .select("group_id")
    .eq("id", studentId)
    .maybeSingle();
  const groupId = (student.data as { group_id: string | null } | null)?.group_id;
  if (!groupId) {
    // Also the "student not visible to this caller" case, thanks to RLS.
    return { ok: false, error: "Студент не найден или не зачислен в группу." };
  }

  const { error, data } = await supabase
    .from("attendance")
    .upsert(
      {
        student_id: studentId,
        group_id: groupId,
        date,
        status,
        marked_by: markedBy,
      } as never,
      { onConflict: "student_id,date" }
    )
    .select("id");

  if (error) return { ok: false, error: error.message };
  if (!data || (data as unknown[]).length === 0) {
    return { ok: false, error: "Нет доступа к этому студенту." };
  }
  return { ok: true };
}
