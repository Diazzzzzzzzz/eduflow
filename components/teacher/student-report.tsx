"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  Check,
  LayoutDashboard,
  MessageSquarePlus,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";
import { useApp } from "@/components/app-provider";
import { BandChip } from "@/components/band-chip";
import { SkillRadarChart } from "@/components/charts/skill-radar-chart";
import { AddResultDialog } from "@/components/teacher/add-result-dialog";
import { StudentHomeworkPanel } from "@/components/teacher/student-homework-panel";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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

export function StudentReport({
  groupId,
  studentId,
}: {
  groupId: string;
  studentId: string;
}) {
  const { students, updateTeacherNote } = useApp();
  const student = students.find((s) => s.id === studentId) ?? null;

  const [tab, setTab] = React.useState<Tab>("overview");
  const [noteOpen, setNoteOpen] = React.useState(false);
  const [note, setNote] = React.useState("");
  const [saved, setSaved] = React.useState(false);

  React.useEffect(() => {
    setNote(student?.teacherNote ?? "");
  }, [student?.id, student?.teacherNote]);

  const backHref = `/teacher/groups/${groupId}`;

  // The roster loads client-side; show a light state until this student resolves.
  if (!student) {
    return (
      <div className="space-y-5">
        <Link
          href={backHref}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Назад к группе
        </Link>
        <Card>
          <CardContent className="p-10 text-center text-sm text-muted-foreground">
            Загрузка данных студента…
          </CardContent>
        </Card>
      </div>
    );
  }

  const latest = student.mockTests[student.mockTests.length - 1];
  const first = student.mockTests[0];
  const delta = latest.overall - first.overall;
  const history = [...student.mockTests].sort((a, b) =>
    b.date.localeCompare(a.date)
  );

  function saveNote() {
    if (!student) return;
    updateTeacherNote(student.id, note.trim());
    setSaved(true);
    setTimeout(() => setNoteOpen(false), 900);
  }

  const metrics = [
    { label: "Текущий балл", value: formatBand(latest.overall), icon: Sparkles, tone: "" },
    { label: "Целевой балл", value: formatBand(student.targetBand), icon: Target, tone: "text-primary" },
    {
      label: "Рост с первого mock",
      value: `${delta >= 0 ? "+" : ""}${formatBand(delta)}`,
      icon: TrendingUp,
      tone: delta >= 0 ? "text-success" : "text-destructive",
    },
    { label: "Посещаемость", value: `${student.attendance}%`, icon: LayoutDashboard, tone: "" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 animate-fade-up">
        <div className="flex items-center gap-4">
          <Link
            href={backHref}
            aria-label="Назад к группе"
            className={cn(buttonVariants({ variant: "outline", size: "icon" }))}
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-base font-semibold text-primary ring-1 ring-inset ring-primary/20">
            {student.initials}
          </span>
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight">
              {student.name}
            </h1>
            <p className="text-sm text-muted-foreground">{student.group}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setSaved(false);
              setNote(student.teacherNote ?? "");
              setNoteOpen((v) => !v);
            }}
          >
            <MessageSquarePlus /> Отзыв для родителя
          </Button>
          <AddResultDialog defaultStudentId={student.id} />
        </div>
      </div>

      {/* Parent feedback editor */}
      {noteOpen && (
        <div className="animate-fade-up space-y-2 rounded-xl border border-primary/25 bg-primary/5 p-4">
          <p className="text-sm font-medium">Отзыв для родителя</p>
          <Textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="min-h-[100px] bg-card"
            placeholder="Короткий комментарий, который увидит родитель в еженедельном отчёте…"
            aria-label="Отзыв для родителя"
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setNoteOpen(false)}>
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

      {tab === "overview" && (
        <div className="space-y-6">
          {/* Enlarged metric cards */}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {metrics.map((m, i) => (
              <Card
                key={m.label}
                className="animate-fade-up"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <CardContent className="flex items-start justify-between p-5">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      {m.label}
                    </p>
                    <p
                      className={cn(
                        "tabular mt-2 font-display text-3xl font-bold",
                        m.tone
                      )}
                    >
                      {m.value}
                    </p>
                  </div>
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-inset ring-primary/20">
                    <m.icon className="h-4.5 w-4.5" size={18} />
                  </span>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Section breakdown + enlarged radar */}
          <div className="grid gap-4 lg:grid-cols-[1fr_1.4fr]">
            <Card>
              <CardContent className="space-y-3 p-5">
                <p className="text-sm font-medium">Разбивка по секциям</p>
                <div className="space-y-2">
                  {SKILLS.map((skill) => (
                    <div
                      key={skill}
                      className="flex items-center justify-between rounded-lg border px-4 py-3"
                    >
                      <span className="text-sm text-muted-foreground">
                        {SKILL_LABELS[skill]}
                      </span>
                      <BandChip band={latest[skill]} size="md" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="space-y-2 p-5">
                <p className="text-sm font-medium">
                  Сильные и слабые стороны · цель {formatBand(student.targetBand)}
                </p>
                <SkillRadarChart
                  latest={latest}
                  target={student.targetBand}
                  heightClass="h-[420px]"
                />
              </CardContent>
            </Card>
          </div>

          {/* Mock history */}
          <Card>
            <CardContent className="space-y-3 p-5">
              <p className="text-sm font-medium">
                История Mock-экзаменов ({history.length})
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                {history.map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center justify-between rounded-lg border px-4 py-3 text-sm"
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
                      size="md"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {tab === "homework" && (
        <Card>
          <CardContent className="p-5">
            <StudentHomeworkPanel student={student} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
