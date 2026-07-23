"use client";

import * as React from "react";
import { ArrowLeft, CalendarDays } from "lucide-react";
import { useApp } from "@/components/app-provider";
import { useGroups, attendanceKey } from "@/components/groups/groups-provider";
import { AttendanceTracker } from "@/components/groups/attendance-tracker";
import { HomeworkManager } from "@/components/groups/homework-manager";
import { BandChip } from "@/components/band-chip";
import { StudentDetailDialog } from "@/components/teacher/student-detail-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatBand } from "@/lib/band";
import { GROUP_SCHEDULES, type AttendanceStatus } from "@/lib/group-data";

type Tab = "students" | "attendance" | "homework";

const TABS: { id: Tab; label: string }[] = [
  { id: "students", label: "Студенты" },
  { id: "attendance", label: "Посещаемость" },
  { id: "homework", label: "Домашние задания" },
];

const ATT_META: Record<AttendanceStatus, { label: string; variant: "success" | "warning" | "destructive" }> = {
  present: { label: "На занятии", variant: "success" },
  late: { label: "Опоздал", variant: "warning" },
  absent: { label: "Отсутствует", variant: "destructive" },
};

export function GroupDetail({
  groupName,
  onBack,
}: {
  groupName: string;
  onBack: () => void;
}) {
  const { students } = useApp();
  const { attendance } = useGroups();
  const [tab, setTab] = React.useState<Tab>("students");
  const [detailId, setDetailId] = React.useState<string | null>(null);
  const [today, setToday] = React.useState("");

  React.useEffect(() => setToday(new Date().toISOString().slice(0, 10)), []);

  const members = students.filter((s) => s.group === groupName);

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 animate-fade-up">
        <Button variant="outline" size="icon" onClick={onBack} aria-label="Назад к группам">
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

      <nav className="flex items-center gap-1 border-b">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            aria-current={tab === t.id ? "page" : undefined}
            className={cn(
              "-mb-px border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
              tab === t.id
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {tab === "students" && (
        <div className="space-y-2">
          {members.map((s) => {
            const latest = s.mockTests[s.mockTests.length - 1];
            const status = today
              ? attendance[attendanceKey(s.id, today)] ?? "present"
              : "present";
            const meta = ATT_META[status];
            return (
              <Card key={s.id}>
                <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-xs font-semibold">
                      {s.initials}
                    </span>
                    <div>
                      <p className="font-medium leading-tight">{s.name}</p>
                      <Badge variant={meta.variant} className="mt-0.5">
                        {meta.label}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-[11px] text-muted-foreground">Текущий</p>
                      <BandChip band={latest.overall} target={s.targetBand} size="sm" />
                    </div>
                    <div className="text-right">
                      <p className="text-[11px] text-muted-foreground">Цель</p>
                      <p className="tabular text-sm font-medium">
                        {formatBand(s.targetBand)}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDetailId(s.id)}
                    >
                      Открыть
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {tab === "attendance" && <AttendanceTracker students={members} />}
      {tab === "homework" && (
        <HomeworkManager groupName={groupName} students={members} />
      )}

      <StudentDetailDialog
        studentId={detailId}
        onOpenChange={(open) => {
          if (!open) setDetailId(null);
        }}
      />
    </div>
  );
}
