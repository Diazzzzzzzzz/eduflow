/**
 * Groups visible to the caller.
 *
 * RLS (0012) scopes `groups` to the centre for staff and to their own group for
 * a student/parent. That is the security boundary; on top of it a TEACHER is
 * narrowed to the groups they actually run, because the overview otherwise
 * listed every group in the centre with "0 students" — rows whose contents the
 * teacher cannot see and is not responsible for.
 *
 * SERVER ONLY.
 */
import { createRlsClient } from "@/lib/supabase/auth-server";
import { isDemoSession } from "@/lib/demo-session";
import { GROUP_LIST } from "@/lib/group-data";
import type { Session } from "@/lib/supabase/auth-server";

export interface GroupSummary {
  id: string;
  name: string;
  schedule: string;
}

export async function getGroupsForSession(
  session: Session
): Promise<GroupSummary[]> {
  // Demo runs entirely on the bundled fixtures — never the centre's database.
  if (isDemoSession(session.user.id)) {
    return GROUP_LIST.map((g) => ({
      id: `demo-${g.name}`,
      name: g.name,
      schedule: g.schedule,
    }));
  }

  const supabase = createRlsClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("groups")
    .select("id, name, schedule, teacher_id")
    .order("name");

  if (error) {
    console.warn("[data/groups] list:", error.message);
    return [];
  }

  let rows =
    (data as unknown as {
      id: string;
      name: string;
      schedule: string | null;
      teacher_id: string | null;
    }[]) ?? [];

  if (session.profile?.role === "teacher") {
    const teacher = await supabase
      .from("teachers")
      .select("id")
      .eq("user_id", session.user.id)
      .maybeSingle();
    const teacherId = (teacher.data as { id: string } | null)?.id;
    // Only narrow when the teacher is actually assigned somewhere; otherwise
    // leave the centre list rather than showing them an empty dashboard.
    if (teacherId) {
      const own = rows.filter((g) => g.teacher_id === teacherId);
      if (own.length > 0) rows = own;
    }
  }

  return rows.map((g) => ({
    id: g.id,
    name: g.name,
    schedule: g.schedule ?? "",
  }));
}
