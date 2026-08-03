import { NextResponse } from "next/server";
import {
  demoTeacherAnalytics,
  getTeacherAnalytics,
} from "@/lib/data/teacher-analytics";
import { getUserProfile } from "@/lib/supabase/auth-server";
import { canAccessAdmin } from "@/lib/auth-routes";
import { isDemoSession } from "@/lib/demo-session";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/teachers/[id] — one teacher's cohort analytics.
 *
 * Leadership only, checked here as well as on the page: the page guard stops
 * navigation, this stops anyone reading a colleague's figures straight from the
 * endpoint.
 */
export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getUserProfile();
  if (!session) {
    return NextResponse.json({ error: "Требуется вход." }, { status: 401 });
  }
  if (!canAccessAdmin(session.profile?.role)) {
    return NextResponse.json(
      { error: "Доступ только для администрации школы." },
      { status: 403 }
    );
  }

  // A demo session is served entirely from the bundled fixtures — it must not
  // read the centre's database, and the showcase has to work before any real
  // teacher exists.
  const analytics = isDemoSession(session.user.id)
    ? demoTeacherAnalytics(params.id)
    : await getTeacherAnalytics(params.id);

  if (!analytics) {
    return NextResponse.json(
      { error: "Преподаватель не найден." },
      { status: 404 }
    );
  }
  return NextResponse.json(analytics);
}
