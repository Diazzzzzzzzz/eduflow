"use client";

import { useRouter } from "next/navigation";
import { OverviewCards } from "@/components/teacher/overview-cards";
import { WritingEvaluator } from "@/components/teacher/writing-evaluator";
import { GroupsOverview } from "@/components/groups/groups-overview";

export function TeacherDashboard() {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <div className="animate-fade-up">
        <h1 className="font-display text-2xl font-bold tracking-tight">
          Добрый день, Дана
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
      <WritingEvaluator />
    </div>
  );
}
