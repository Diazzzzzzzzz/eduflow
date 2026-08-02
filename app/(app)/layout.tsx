import { redirect } from "next/navigation";
import { AppProvider } from "@/components/app-provider";
import { ClassroomProvider } from "@/components/classroom/classroom-provider";
import { GroupsProvider } from "@/components/groups/groups-provider";
import { AppChrome } from "@/components/layout/app-chrome";
import { FocusModeProvider } from "@/components/layout/focus-mode";
import { SessionProvider } from "@/components/session-provider";
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
    <SessionProvider user={menuUser}>
      <AppProvider>
        <GroupsProvider>
          {/* Mounted app-wide so a live lesson survives moving between the test
              room and the lesson materials. */}
          <ClassroomProvider>
            {/* Above AppChrome: the chrome itself is what focus mode removes. */}
            <FocusModeProvider>
              <AppChrome user={menuUser}>{children}</AppChrome>
            </FocusModeProvider>
          </ClassroomProvider>
        </GroupsProvider>
      </AppProvider>
    </SessionProvider>
  );
}
