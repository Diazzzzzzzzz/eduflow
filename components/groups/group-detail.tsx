"use client";

import * as React from "react";
import {
  ArrowLeft,
  BookOpen,
  CalendarDays,
  ClipboardList,
  GraduationCap,
} from "lucide-react";
import { useApp } from "@/components/app-provider";
import { AttendanceTracker } from "@/components/groups/attendance-tracker";
import { HomeworkManager } from "@/components/groups/homework-manager";
import { AddResultDialog } from "@/components/teacher/add-result-dialog";
import { Gradebook } from "@/components/teacher/gradebook";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { GROUP_SCHEDULES } from "@/lib/group-data";

type Tab = "students" | "homework" | "attendance";

const TABS: { id: Tab; label: string; icon: typeof GraduationCap }[] = [
  { id: "students", label: "Студенты", icon: GraduationCap },
  { id: "homework", label: "Домашние задания", icon: BookOpen },
  { id: "attendance", label: "Посещаемость", icon: ClipboardList },
];

export function GroupDetail({
  groupName,
  onBack,
}: {
  groupName: string;
  onBack: () => void;
}) {
  const { students } = useApp();
  const [tab, setTab] = React.useState<Tab>("students");
  const members = students.filter((s) => s.group === groupName);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 animate-fade-up">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={onBack}
            aria-label="Назад к группам"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="font-display text-lg font-semibold leading-tight">
              {groupName}
            </h2>
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              <CalendarDays className="h-3.5 w-3.5" /> {GROUP_SCHEDULES[groupName]}{" "}
              · {members.length} студентов
            </p>
          </div>
        </div>
        <AddResultDialog defaultStudentId={members[0]?.id} />
      </div>

      {/* Tabs */}
      <nav className="flex items-center gap-1 border-b">
        {TABS.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              aria-current={tab === t.id ? "page" : undefined}
              className={cn(
                "-mb-px flex items-center gap-1.5 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
                tab === t.id
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {t.label}
            </button>
          );
        })}
      </nav>

      {tab === "students" && <Gradebook groupName={groupName} />}
      {tab === "homework" && (
        <HomeworkManager groupName={groupName} students={members} />
      )}
      {tab === "attendance" && <AttendanceTracker students={members} />}
    </div>
  );
}
