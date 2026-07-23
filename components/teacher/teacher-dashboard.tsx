"use client";

import * as React from "react";
import { OverviewCards } from "@/components/teacher/overview-cards";
import { WritingEvaluator } from "@/components/teacher/writing-evaluator";
import { GroupsOverview } from "@/components/groups/groups-overview";
import { GroupDetail } from "@/components/groups/group-detail";

export function TeacherDashboard() {
  const [selectedGroup, setSelectedGroup] = React.useState<string | null>(null);

  // Group workspace takes over the view when a group is open.
  if (selectedGroup) {
    return (
      <GroupDetail
        groupName={selectedGroup}
        onBack={() => setSelectedGroup(null)}
      />
    );
  }

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
      <GroupsOverview onSelect={setSelectedGroup} />
      <WritingEvaluator />
    </div>
  );
}
