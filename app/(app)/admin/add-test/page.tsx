import { redirect } from "next/navigation";
import { TestBuilder } from "@/components/admin/test-builder";
import { getUserProfile } from "@/lib/supabase/auth-server";

export const dynamic = "force-dynamic";

export default async function AddTestPage() {
  const session = await getUserProfile();
  if (!session) redirect("/login");
  // Content authoring belongs to staff; students only sit the papers.
  if (session.profile?.role === "student") redirect("/student");

  return <TestBuilder />;
}
