"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  Clock,
  ClipboardList,
  GraduationCap,
  Layers,
} from "lucide-react";
import { useApp } from "@/components/app-provider";
import { useSession } from "@/components/session-provider";
import { AttendanceTracker } from "@/components/groups/attendance-tracker";
import { CurrentLessonControl } from "@/components/lessons/current-lesson-control";
import { HomeworkManager } from "@/components/groups/homework-manager";
import { AddResultDialog } from "@/components/teacher/add-result-dialog";
import { Gradebook } from "@/components/teacher/gradebook";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { canAccessAdmin, roleHome } from "@/lib/auth-routes";
import { GROUP_SCHEDULES } from "@/lib/group-data";

type Tab = "students" | "lessons" | "homework" | "attendance";

const TABS: { id: Tab; label: string; icon: typeof GraduationCap }[] = [
  { id: "students", label: "Студенты", icon: GraduationCap },
  { id: "lessons", label: "Уроки", icon: Layers },
  { id: "homework", label: "Домашние задания", icon: BookOpen },
  { id: "attendance", label: "Посещаемость", icon: ClipboardList },
];

export function GroupDetail({ groupName }: { groupName: string }) {
  const { students } = useApp();
  const { role } = useSession();
  const [tab, setTab] = React.useState<Tab>("students");
  const members = students.filter((s) => s.group === groupName);

  // The group workspace is shared: leadership reaches it from the director
  // dashboard, a teacher from their own. "Up" therefore follows the viewer's
  // role, not the /teacher/... prefix this page happens to be filed under —
  // sending a director to /teacher was what made the app look like it had
  // demoted them.
  const leadership = canAccessAdmin(role);
  const backHref = roleHome(role);
  const backLabel = leadership
    ? "Назад в панель директора"
    : "Назад к моим группам";
  const rootLabel = leadership ? "Панель директора" : "Мои группы";

  return (
    <div className="space-y-5">
      {/* Breadcrumbs — make the return path explicit, since two different
          dashboards lead here. */}
      <nav aria-label="Хлебные крошки" className="animate-fade-up">
        <ol className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
          <li>
            <Link href={backHref} className="transition-colors hover:text-foreground">
              {rootLabel}
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li className="font-medium text-foreground">{groupName}</li>
        </ol>
      </nav>

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 animate-fade-up">
        <div className="flex items-center gap-3">
          <Link
            href={backHref}
            aria-label={backLabel}
            className={cn(buttonVariants({ variant: "outline", size: "icon" }))}
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h2 className="font-display text-lg font-semibold leading-tight">
              {groupName}
            </h2>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="gap-1 font-normal">
                <Clock className="h-3 w-3" /> {GROUP_SCHEDULES[groupName]}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {members.length} студентов
              </span>
            </div>
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
      {tab === "lessons" && <CurrentLessonControl groupName={groupName} />}
      {tab === "homework" && (
        <HomeworkManager groupName={groupName} students={members} />
      )}
      {tab === "attendance" && <AttendanceTracker students={members} />}
    </div>
  );
}
