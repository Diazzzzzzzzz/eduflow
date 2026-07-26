import { redirect } from "next/navigation";
import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { getUserProfile } from "@/lib/supabase/auth-server";
import { canAccessAdmin, roleHome } from "@/lib/auth-routes";

export const dynamic = "force-dynamic";

/**
 * Director dashboard.
 *
 * Guarded here rather than in an `/admin` layout on purpose: /admin/add-test is
 * the teachers' test builder and must stay reachable for them. The matching
 * API route repeats this check so the data can't be read around the page.
 */
export default async function AdminPage() {
  const session = await getUserProfile();
  if (!session) redirect("/login");

  const role = session.profile?.role;
  if (!canAccessAdmin(role)) redirect(roleHome(role));

  return <AdminDashboard />;
}
