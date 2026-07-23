import { redirect } from "next/navigation";
import { AppProvider } from "@/components/app-provider";
import { Topbar } from "@/components/layout/topbar";
import { SiteFooter } from "@/components/layout/site-footer";
import { getUserProfile } from "@/lib/supabase/auth-server";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getUserProfile();
  if (!session) redirect("/login");

  const { user, profile } = session;
  const menuUser = {
    email: user.email ?? "",
    role: profile?.role ?? "student",
    fullName: profile?.full_name ?? "",
  };

  return (
    <AppProvider>
      <div className="canvas-grid flex min-h-screen flex-col">
        <Topbar user={menuUser} />
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6">
          {children}
        </main>
        <SiteFooter />
      </div>
    </AppProvider>
  );
}
