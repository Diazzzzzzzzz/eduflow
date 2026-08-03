"use client";

import * as React from "react";
import {
  AlertTriangle,
  BookOpen,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  GraduationCap,
  Mail,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";
import { BandChip } from "@/components/band-chip";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { STAFF_ROLE_LABELS } from "@/lib/admin-data";
import { formatBand } from "@/lib/band";
import { countOf } from "@/lib/plural";
import { cn } from "@/lib/utils";
import type { TeacherAnalytics } from "@/lib/data/teacher-analytics";
import type { TeacherLoad } from "@/lib/data/admin";

/** A dash beats a zero: an absent figure is not the same as a bad one. */
function orDash(value: number | null, format: (n: number) => string): string {
  return value == null ? "—" : format(value);
}

export function TeacherDetailDialog({
  teacher,
  onClose,
}: {
  teacher: TeacherLoad | null;
  onClose: () => void;
}) {
  const [data, setData] = React.useState<TeacherAnalytics | null>(null);
  const [state, setState] = React.useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = React.useState<string | null>(null);

  const teacherId = teacher?.id ?? null;

  React.useEffect(() => {
    if (!teacherId) {
      setData(null);
      setState("idle");
      return;
    }
    let cancelled = false;
    setState("loading");
    setData(null);
    setError(null);
    fetch(`/api/admin/teachers/${encodeURIComponent(teacherId)}`, {
      credentials: "include",
    })
      .then(async (r) => {
        const json = (await r.json()) as TeacherAnalytics & { error?: string };
        if (cancelled) return;
        if (!r.ok) {
          setError(json.error ?? "Не удалось загрузить аналитику.");
          setState("error");
          return;
        }
        setData(json);
        setState("idle");
      })
      .catch(() => {
        if (cancelled) return;
        setError("Не удалось загрузить аналитику.");
        setState("error");
      });
    return () => {
      cancelled = true;
    };
  }, [teacherId]);

  return (
    <Dialog open={!!teacher} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[88vh] max-w-3xl overflow-y-auto">
        {teacher && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary ring-1 ring-inset ring-primary/20">
                  {teacher.initials}
                </span>
                <span className="min-w-0">
                  <span className="block truncate">{teacher.name}</span>
                  <span className="mt-0.5 flex flex-wrap items-center gap-2 text-xs font-normal text-muted-foreground">
                    <Badge variant={teacher.role === "teacher" ? "secondary" : "default"}>
                      {STAFF_ROLE_LABELS[teacher.role]}
                    </Badge>
                    {teacher.email && (
                      // An address is one unbreakable token, so it needs to be
                      // allowed to shrink or it pushes the dialog wider than
                      // the viewport on a phone.
                      <span className="inline-flex min-w-0 max-w-full items-center gap-1">
                        <Mail className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{teacher.email}</span>
                      </span>
                    )}
                  </span>
                </span>
              </DialogTitle>
              <DialogDescription className="sr-only">
                Аналитика преподавателя {teacher.name}
              </DialogDescription>
            </DialogHeader>

            {state === "loading" && <DetailSkeleton />}

            {state === "error" && (
              <div
                role="alert"
                className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
              >
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {data && state === "idle" && <TeacherBody data={data} />}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function TeacherBody({ data }: { data: TeacherAnalytics }) {
  const { kpis, homework } = data;

  const kpiCards = [
    {
      label: "Средний балл",
      value: orDash(kpis.averageBand, formatBand),
      hint: countOf(data.studentCount, "студент", "студента", "студентов"),
      icon: GraduationCap,
    },
    {
      label: "Посещаемость",
      value: orDash(kpis.attendance, (n) => `${n}%`),
      hint: countOf(data.groups.length, "группа", "группы", "групп"),
      icon: CalendarClock,
    },
    {
      label: "Проверено ДЗ",
      value: orDash(kpis.reviewedRate, (n) => `${n}%`),
      hint: "от сданных работ",
      icon: CheckCircle2,
    },
  ];

  return (
    <div className="space-y-5">
      {/* KPIs */}
      <div className="grid gap-3 sm:grid-cols-3">
        {kpiCards.map((k) => (
          <div key={k.label} className="rounded-lg border bg-secondary/30 p-3">
            <p className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              <k.icon className="h-3.5 w-3.5" /> {k.label}
            </p>
            <p className="tabular mt-1 font-display text-2xl font-bold">
              {k.value}
            </p>
            <p className="text-xs text-muted-foreground">{k.hint}</p>
          </div>
        ))}
      </div>

      {/* Groups */}
      <section className="space-y-2">
        <h3 className="flex items-center gap-2 text-sm font-medium">
          <Users className="h-4 w-4 text-muted-foreground" /> Группы
        </h3>
        {data.groups.length === 0 ? (
          <p className="rounded-lg border border-dashed py-6 text-center text-sm text-muted-foreground">
            За преподавателем не закреплено ни одной группы.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {data.groups.map((g) => (
              <span
                key={g.name}
                className="inline-flex items-center gap-2 rounded-md border bg-card px-2.5 py-1.5 text-sm"
              >
                <span className="font-medium">{g.name}</span>
                <span className="tabular text-xs text-muted-foreground">
                  {countOf(g.students, "студент", "студента", "студентов")}
                </span>
                {g.schedule && (
                  <span className="hidden text-xs text-muted-foreground sm:inline">
                    · {g.schedule}
                  </span>
                )}
              </span>
            ))}
          </div>
        )}
      </section>

      {/* Homework */}
      <section className="space-y-2">
        <h3 className="flex items-center gap-2 text-sm font-medium">
          <ClipboardList className="h-4 w-4 text-muted-foreground" /> Домашние
          задания
        </h3>
        <div className="rounded-lg border p-3">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: "Выдано заданий", value: homework.tasks },
              { label: "Проверено", value: homework.graded },
              { label: "Ждут проверки", value: homework.awaitingReview },
              { label: "Не сдано", value: homework.notSubmitted },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                  {s.label}
                </p>
                <p className="tabular mt-0.5 font-display text-lg font-semibold">
                  {s.value}
                </p>
              </div>
            ))}
          </div>

          {homework.total > 0 && (
            <div className="mt-3 space-y-1.5">
              <Progress
                value={((homework.graded / homework.total) * 100) | 0}
                aria-label={`Проверено ${homework.graded} из ${homework.total} работ`}
                indicatorClassName={
                  homework.awaitingReview === 0 ? "bg-success" : undefined
                }
              />
              <p className="tabular flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  {homework.graded} из{" "}
                  {countOf(homework.total, "работы", "работ", "работ")} проверено
                </span>
                <span>
                  Средняя оценка:{" "}
                  {orDash(homework.averageBand, formatBand)}
                </span>
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Students */}
      <section className="space-y-2">
        <h3 className="flex items-center gap-2 text-sm font-medium">
          <BookOpen className="h-4 w-4 text-muted-foreground" /> Студенты (
          {data.students.length})
        </h3>
        {data.students.length === 0 ? (
          <p className="rounded-lg border border-dashed py-6 text-center text-sm text-muted-foreground">
            За преподавателем пока нет студентов.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Студент</TableHead>
                  <TableHead>Группа</TableHead>
                  <TableHead className="text-center">Балл</TableHead>
                  <TableHead className="text-center">Динамика</TableHead>
                  <TableHead className="text-center">Посещ.</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.students.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell>
                      <span className="flex items-center gap-2.5">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-secondary text-[10px] font-semibold">
                          {s.initials}
                        </span>
                        <span className="text-sm font-medium">{s.name}</span>
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {s.group}
                    </TableCell>
                    <TableCell className="text-center">
                      {s.band != null ? (
                        <BandChip band={s.band} size="sm" />
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {s.delta == null ? (
                        <span className="text-xs text-muted-foreground">—</span>
                      ) : (
                        <span
                          className={cn(
                            "tabular inline-flex items-center gap-1 text-xs font-medium",
                            s.delta > 0
                              ? "text-success"
                              : s.delta < 0
                                ? "text-destructive"
                                : "text-muted-foreground"
                          )}
                        >
                          {s.delta > 0 ? (
                            <TrendingUp className="h-3.5 w-3.5" />
                          ) : s.delta < 0 ? (
                            <TrendingDown className="h-3.5 w-3.5" />
                          ) : null}
                          {s.delta > 0 ? "+" : ""}
                          {s.delta.toFixed(1)}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="tabular text-center text-sm">
                      {s.attendance}%
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </section>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="space-y-5" aria-busy aria-live="polite">
      <span className="sr-only">Загружаем аналитику преподавателя…</span>
      <div className="grid gap-3 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-[86px] rounded-lg" />
        ))}
      </div>
      <Skeleton className="h-9 w-48" />
      <Skeleton className="h-28 rounded-lg" />
      <Skeleton className="h-40 rounded-lg" />
    </div>
  );
}
