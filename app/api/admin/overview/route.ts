import { NextResponse } from "next/server";
import { getAdminOverview } from "@/lib/data/admin";
import { getUserProfile } from "@/lib/supabase/auth-server";
import { canAccessAdmin } from "@/lib/auth-routes";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/overview — everything the director dashboard renders.
 *
 * Gated here as well as on the page: the page guard stops navigation, this
 * stops anyone reading centre-wide figures straight from the endpoint.
 */
export async function GET() {
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

  return NextResponse.json(await getAdminOverview());
}
