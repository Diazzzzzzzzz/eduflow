"use client";

import * as React from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  CircleDashed,
  FileText,
  PlayCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useCourse } from "@/lib/use-course";
import {
  courseProgress,
  lessonStatus,
  LESSON_SKILL_LABELS,
  LESSON_STATUS_LABELS,
  type Lesson,
  type LessonStatus,
} from "@/lib/lessons-data";
import { LessonDialog } from "./lesson-dialog";

const STATUS_ICON: Record<LessonStatus, typeof CheckCircle2> = {
  completed: CheckCircle2,
  current: PlayCircle,
  upcoming: CircleDashed,
};

/** Connected view: loads the course for a group and renders the board. */
export function LessonsView({
  groupName,
  title = "Программа курса",
}: {
  groupName: string;
  title?: string;
}) {
  const { lessons, currentLesson, total, status } = useCourse(groupName);
  return (
    <LessonBoard
      groupName={groupName}
      title={title}
      lessons={lessons}
      currentLesson={currentLesson}
      total={total}
      status={status}
    />
  );
}

/**
 * Presentational syllabus board.
 *
 * Takes the course as props so a parent that already loaded it (the teacher's
 * control panel) can share one fetch and stay in sync after an update, rather
 * than each component holding its own copy.
 */
export function LessonBoard({
  groupName,
  title = "Программа курса",
  lessons,
  currentLesson,
  total,
  status,
}: {
  groupName: string;
  title?: string;
  lessons: Lesson[];
  currentLesson: number;
  total: number;
  status: "loading" | "ready" | "error";
}) {
  const [open, setOpen] = React.useState<Lesson | null>(null);

  if (status === "loading") return <LessonsSkeleton />;

  const progress = courseProgress(currentLesson, total);
  const completed = Math.max(currentLesson - 1, 0);

  return (
    <div className="space-y-5">
      {status === "error" && (
        <p className="flex items-start gap-2 rounded-lg border border-warning/30 bg-warning/5 px-3 py-2 text-sm text-warning">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          Не удалось получить прогресс группы с сервера — показана программа
          курса по умолчанию.
        </p>
      )}

      {/* Progress header */}
      <Card className="animate-fade-up">
        <CardContent className="space-y-4 p-5">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {title}
              </p>
              <p className="tabular mt-1 font-display text-2xl font-bold">
                Урок {currentLesson} из {total}
              </p>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {groupName}
              </p>
            </div>
            <div className="text-right">
              <p className="tabular font-display text-2xl font-bold text-primary">
                {progress}%
              </p>
              <p className="text-xs text-muted-foreground">завершено</p>
            </div>
          </div>

          <Progress
            value={progress}
            aria-label={`Прогресс курса: ${progress}%`}
          />

          <div className="tabular flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted-foreground">
            <span>
              <span className="font-medium text-success">{completed}</span>{" "}
              пройдено
            </span>
            <span>
              <span className="font-medium text-primary">1</span> текущий
            </span>
            <span>
              <span className="font-medium text-foreground">
                {Math.max(total - currentLesson, 0)}
              </span>{" "}
              впереди
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Lesson list */}
      <ol className="space-y-2">
        {lessons.map((lesson, i) => {
          const st = lessonStatus(lesson.number, currentLesson);
          const Icon = STATUS_ICON[st];
          const hasMaterials = lesson.materials.length > 0;

          return (
            <li key={lesson.number}>
              <button
                type="button"
                onClick={() => setOpen(lesson)}
                className={cn(
                  "group flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  st === "current"
                    ? "border-primary bg-primary/5 ring-1 ring-inset ring-primary/20"
                    : "bg-card",
                  st === "upcoming" && "opacity-80"
                )}
                style={{ animationDelay: `${Math.min(i, 12) * 25}ms` }}
              >
                <span
                  className={cn(
                    "tabular flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-semibold ring-1 ring-inset",
                    st === "completed" &&
                      "bg-success/10 text-success ring-success/25",
                    st === "current" && "bg-primary text-white ring-primary",
                    st === "upcoming" &&
                      "bg-secondary text-muted-foreground ring-border"
                  )}
                >
                  {st === "completed" ? (
                    <Icon className="h-4 w-4" />
                  ) : (
                    lesson.number
                  )}
                </span>

                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <span
                      className={cn(
                        "font-medium leading-tight",
                        st === "current" && "text-primary"
                      )}
                    >
                      {lesson.title}
                    </span>
                    {st === "current" && (
                      <Badge variant="default">
                        {LESSON_STATUS_LABELS.current}
                      </Badge>
                    )}
                    {hasMaterials && (
                      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                        <FileText className="h-3 w-3" /> материалы
                      </span>
                    )}
                  </span>
                  <span className="mt-0.5 line-clamp-1 block text-xs text-muted-foreground">
                    {LESSON_SKILL_LABELS[lesson.skill]} ·{" "}
                    {LESSON_STATUS_LABELS[st]}
                  </span>
                </span>

                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
              </button>
            </li>
          );
        })}
      </ol>

      <LessonDialog
        lesson={open}
        status={open ? lessonStatus(open.number, currentLesson) : "upcoming"}
        total={total}
        onClose={() => setOpen(null)}
      />
    </div>
  );
}

function LessonsSkeleton() {
  return (
    <div className="space-y-5" aria-busy aria-live="polite">
      <span className="sr-only">Загружаем программу курса…</span>
      <Card>
        <CardContent className="space-y-4 p-5">
          <div className="flex items-end justify-between gap-3">
            <div className="space-y-2">
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-7 w-44" />
              <Skeleton className="h-3.5 w-24" />
            </div>
            <Skeleton className="h-9 w-16" />
          </div>
          <Skeleton className="h-2 w-full rounded-full" />
        </CardContent>
      </Card>
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 rounded-lg border p-3">
            <Skeleton className="h-9 w-9 shrink-0 rounded-lg" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
