"use client";

import { useRouter } from "next/navigation";
import { OverviewCards } from "@/components/teacher/overview-cards";
import { firstNameOf, useSession } from "@/components/session-provider";
import { GroupsOverview } from "@/components/groups/groups-overview";

export function TeacherDashboard() {
  const router = useRouter();
  // Was hardcoded to "Дана", so every teacher was greeted by one colleague's
  // name — and a director who landed here was told they were her.
  const name = firstNameOf(useSession());

  return (
    <div className="space-y-6">
      <div className="animate-fade-up">
        <h1 className="font-display text-2xl font-bold tracking-tight">
          {name ? `Добрый день, ${name}` : "Добрый день"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Как ваш центр показывает себя в этом семестре.
        </p>
      </div>
      <OverviewCards />
      <GroupsOverview
        onSelect={(name) =>
          router.push(`/teacher/groups/${encodeURIComponent(name)}`)
        }
      />
    </div>
  );
}
