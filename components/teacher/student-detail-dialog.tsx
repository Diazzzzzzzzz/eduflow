"use client";

import * as React from "react";
import { BookOpen, Check, LayoutDashboard, MessageSquarePlus, Target } from "lucide-react";
import { useApp } from "@/components/app-provider";
import { BandChip } from "@/components/band-chip";
import { SkillRadarChart } from "@/components/charts/skill-radar-chart";
import { AddResultDialog } from "@/components/teacher/add-result-dialog";
import { StudentHomeworkPanel } from "@/components/teacher/student-homework-panel";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { formatBand, SKILL_LABELS } from "@/lib/band";
import { formatDayMonthYear } from "@/lib/date";
import { SKILLS } from "@/lib/types";

type Tab = "overview" | "homework";

const TABS: { id: Tab; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "overview", label: "Обзор и Mock-баллы", icon: LayoutDashboard },
  { id: "homework", label: "Домашние задания", icon: BookOpen },
];

/**
 * Teacher-side detail view for one student. Opens inside the Teacher Workspace
 * — it never navigates to the Student persona.
 */
export function StudentDetailDialog({
  studentId,
  onOpenChange,
}: {
  studentId: string | null;
  onOpenChange: (open: boolean) => void;
}) {
  const { students, updateTeacherNote } = useApp();
  const student = students.find((s) => s.id === studentId) ?? null;

  const [tab, setTab] = React.useState<Tab>("overview");
  const [noteOpen, setNoteOpen] = React.useState(false);
  const [note, setNote] = React.useState("");
  const [saved, setSaved] = React.useState(false);

  // Reset tab + feedback editor whenever a different student is opened.
  React.useEffect(() => {
    setTab("overview");
    setNoteOpen(false);
    setSaved(false);
    setNote(student?.teacherNote ?? "");
  }, [student?.id, student?.teacherNote]);

  function saveNote() {
    if (!student) return;
    updateTeacherNote(student.id, note.trim());
    setSaved(true);
    setTimeout(() => setNoteOpen(false), 900);
  }

  const latest = student?.mockTests[student.mockTests.length - 1];
  const history = student
    ? [...student.mockTests].sort((a, b) => b.date.localeCompare(a.date))
    : [];

  return (
    <Dialog open={!!student} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] max-w-2xl overflow-y-auto">
        {student && latest && (
          <>
            <DialogHeader>
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary ring-1 ring-inset ring-primary/20">
                  {student.initials}
                </span>
                <div>
                  <DialogTitle className="font-display">
                    {student.name}
                  </DialogTitle>
                  <DialogDescription>{student.group}</DialogDescription>
                </div>
              </div>
            </DialogHeader>

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
                      "-mb-px flex items-center gap-1.5 border-b-2 px-3 py-2.5 text-sm font-medium transition-colors",
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

            {tab === "overview" && (
              <div className="space-y-5">
                {/* Overview metrics */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  <div className="rounded-lg border bg-secondary/40 p-3">
                    <p className="text-xs text-muted-foreground">Текущий балл</p>
                    <p className="tabular mt-1 font-display text-2xl font-bold">
                      {formatBand(latest.overall)}
                    </p>
                  </div>
                  <div className="rounded-lg border bg-secondary/40 p-3">
                    <p className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Target className="h-3 w-3" /> Целевой балл
                    </p>
                    <p className="tabular mt-1 font-display text-2xl font-bold text-primary">
                      {formatBand(student.targetBand)}
                    </p>
                  </div>
                  <div className="rounded-lg border bg-secondary/40 p-3">
                    <p className="text-xs text-muted-foreground">Посещаемость</p>
                    <p className="tabular mt-1 font-display text-2xl font-bold">
                      {student.attendance}%
                    </p>
                  </div>
                </div>

                {/* Section breakdown */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Разбивка по секциям</p>
                    <div className="grid grid-cols-2 gap-2">
                      {SKILLS.map((skill) => (
                        <div
                          key={skill}
                          className="flex items-center justify-between rounded-md border px-3 py-2"
                        >
                          <span className="text-xs text-muted-foreground">
                            {SKILL_LABELS[skill]}
                          </span>
                          <BandChip band={latest[skill]} size="sm" />
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-lg border p-2">
                    <SkillRadarChart latest={latest} target={student.targetBand} />
                  </div>
                </div>

                {/* Mock history */}
                <div className="space-y-2">
                  <p className="text-sm font-medium">
                    История Mock-экзаменов ({history.length})
                  </p>
                  <ul className="space-y-1.5">
                    {history.map((t) => (
                      <li
                        key={t.id}
                        className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
                      >
                        <div>
                          <p className="font-medium">{t.label}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDayMonthYear(t.date)}
                          </p>
                        </div>
                        <BandChip
                          band={t.overall}
                          target={student.targetBand}
                          size="sm"
                        />
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Parent feedback editor */}
                {noteOpen && (
                  <div className="space-y-2 rounded-lg border border-primary/25 bg-primary/5 p-3">
                    <p className="text-sm font-medium">Отзыв для родителя</p>
                    <Textarea
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      className="min-h-[100px] bg-card"
                      placeholder="Короткий комментарий, который увидит родитель в еженедельном отчёте…"
                      aria-label="Отзыв для родителя"
                    />
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setNoteOpen(false)}
                      >
                        Отмена
                      </Button>
                      <Button
                        size="sm"
                        variant={saved ? "success" : "default"}
                        onClick={saveNote}
                      >
                        {saved ? (
                          <>
                            <Check /> Сохранено
                          </>
                        ) : (
                          "Сохранить"
                        )}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Teacher actions */}
                <div className="flex flex-wrap justify-end gap-2 border-t pt-4">
                  {!noteOpen && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSaved(false);
                        setNote(student.teacherNote ?? "");
                        setNoteOpen(true);
                      }}
                    >
                      <MessageSquarePlus /> Отзыв для родителя
                    </Button>
                  )}
                  <AddResultDialog defaultStudentId={student.id} />
                </div>
              </div>
            )}

            {tab === "homework" && <StudentHomeworkPanel student={student} />}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
