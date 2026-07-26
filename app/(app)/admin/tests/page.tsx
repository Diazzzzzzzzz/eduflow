import { redirect } from "next/navigation";
import { TestCatalog } from "@/components/admin/test-catalog";
import { getUserProfile } from "@/lib/supabase/auth-server";
import { canAccessAdmin, roleHome } from "@/lib/auth-routes";

export const dynamic = "force-dynamic";

/** Test catalogue and JSON import. Leadership only, like the dashboard. */
export default async function AdminTestsPage() {
  const session = await getUserProfile();
  if (!session) redirect("/login");

  const role = session.profile?.role;
  if (!canAccessAdmin(role)) redirect(roleHome(role));

  return <TestCatalog />;
}
