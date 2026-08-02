/**
 * Class sessions — the timetable behind attendance.
 *
 * `class_sessions` already exists (migration 0014) and is created lazily when
 * the first attendance mark of a day lands. This adds the other direction:
 * scheduling a lesson ahead of time with a topic, so the register says which
 * lesson it belongs to instead of just a date.
 *
 * Runs under the caller's session; RLS (0014) scopes rows to the centre for
 * staff and to their own group for a student/parent.
 *
 * SERVER ONLY.
 */
import { createRlsClient } from "@/lib/supabase/auth-server";

export interface ClassSession {
  id: string;
  groupName: string;
  date: string;
  topic: string | null;
  lessonNumber: number | null;
}

type Row = {
  id: string;
  date: string;
  topic: string | null;
  lesson_number: number | null;
  groups: { name: string } | null;
};

function map(r: Row): ClassSession {
  return {
    id: r.id,
    groupName: r.groups?.name ?? "",
    date: r.date,
    topic: r.topic,
    lessonNumber: r.lesson_number,
  };
}

/** Scheduled lessons visible to the caller, optionally narrowed to a group. */
export async function listClassSessions(groupName?: string): Promise<ClassSession[]> {
  const supabase = createRlsClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("class_sessions")
    .select("id, date, topic, lesson_number, groups(name)")
    .order("date", { ascending: true });

  if (error) {
    console.warn("[data/schedule] list:", error.message);
    return [];
  }
  const rows = ((data as unknown as Row[]) ?? []).map(map);
  return groupName ? rows.filter((r) => r.groupName === groupName) : rows;
}

export interface MutationResult {
  ok: boolean;
  error?: string;
}

/**
 * Schedule (or re-topic) a lesson. Upsert on (group, date) so setting a topic
 * for a day attendance already created works, rather than colliding with it.
 */
export async function scheduleClassSession(input: {
  groupName: string;
  date: string;
  topic?: string;
  lessonNumber?: number;
}): Promise<MutationResult & { id?: string }> {
  const supabase = createRlsClient();
  if (!supabase) return { ok: false, error: "База данных не настроена." };

  const group = await supabase
    .from("groups")
    .select("id")
    .eq("name", input.groupName)
    .maybeSingle();
  const groupId = (group.data as { id: string } | null)?.id;
  if (!groupId) return { ok: false, error: "Группа не найдена." };

  const { data, error } = await supabase
    .from("class_sessions")
    .upsert(
      {
        group_id: groupId,
        date: input.date,
        topic: input.topic?.trim() || null,
        lesson_number: input.lessonNumber ?? null,
      } as never,
      { onConflict: "group_id,date" }
    )
    .select("id");

  if (error) return { ok: false, error: error.message };
  const rows = (data as unknown as { id: string }[]) ?? [];
  if (rows.length === 0) return { ok: false, error: "Нет доступа к этой группе." };
  return { ok: true, id: rows[0].id };
}
