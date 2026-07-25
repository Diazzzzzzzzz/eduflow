"use client";

import * as React from "react";
import { AlertTriangle, Check, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useCourse } from "@/lib/use-course";
import { courseProgress, lessonStatus } from "@/lib/lessons-data";
import { LessonBoard } from "./lessons-view";

/**
 * Teacher control over where a group sits in the syllabus, above the same
 * lesson list the students see.
 */
export function CurrentLessonControl({ groupName }: { groupName: string }) {
  const { lessons, currentLesson, total, status, setCurrentLesson, saving } =
    useCourse(groupName);
  const [draft, setDraft] = React.useState<number | null>(null);
  const [feedback, setFeedback] = React.useState<
    { kind: "ok" | "error"; text: string } | null
  >(null);

  // Reflect the loaded value once, and whenever it changes underneath us.
  React.useEffect(() => {
    if (currentLesson) setDraft(currentLesson);
  }, [currentLesson]);

  if (status === "loading") {
    return (
      <Card>
        <CardContent className="space-y-3 p-5">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-9 w-72" />
        </CardContent>
      </Card>
    );
  }

  const selected = draft ?? currentLesson;
  const dirty = selected !== currentLesson;
  const next = lessons.find((l) => l.number === currentLesson + 1);

  async function apply(target: number) {
    setFeedback(null);
    const res = await setCurrentLesson(target);
    setFeedback(
      res.ok
        ? { kind: "ok", text: `Группа переведена на урок ${target}.` }
        : { kind: "error", text: res.error ?? "Не удалось сохранить" }
    );
    if (!res.ok) setDraft(currentLesson);
  }

  return (
    <div className="space-y-5">
      <Card>
        <CardContent className="space-y-4 p-5">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-medium">Текущий урок группы</p>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Определяет, что видят студенты как «Текущий» в программе курса.
              </p>
            </div>
            <span className="tabular text-sm text-muted-foreground">
              {courseProgress(currentLesson, total)}% курса
            </span>
          </div>

          <Progress value={courseProgress(currentLesson, total)} />

          <div className="flex flex-wrap items-end gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="current-lesson">Урок</Label>
              <Select
                value={String(selected)}
                onValueChange={(v) => setDraft(Number(v))}
              >
                <SelectTrigger id="current-lesson" className="w-[22rem] max-w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {lessons.map((l) => (
                    <SelectItem key={l.number} value={String(l.number)}>
                      {l.number}. {l.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button disabled={!dirty || saving} onClick={() => apply(selected)}>
              {saving ? (
                <>
                  <Loader2 className="animate-spin" /> Сохранение…
                </>
              ) : (
                <>
                  <Check /> Сохранить
                </>
              )}
            </Button>

            {next && !dirty && (
              <Button
                variant="outline"
                disabled={saving}
                onClick={() => {
                  setDraft(next.number);
                  void apply(next.number);
                }}
              >
                Следующий урок <ChevronRight />
              </Button>
            )}
          </div>

          {feedback && (
            <p
              className={
                feedback.kind === "ok"
                  ? "flex items-center gap-2 rounded-md border border-success/30 bg-success/10 px-3 py-2 text-sm text-success"
                  : "flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
              }
            >
              {feedback.kind === "ok" ? (
                <Check className="h-4 w-4 shrink-0" />
              ) : (
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              )}
              {feedback.text}
            </p>
          )}

          {dirty && (
            <p className="tabular text-xs text-muted-foreground">
              Выбран урок {selected} ({lessonStatus(selected, currentLesson) === "completed"
                ? "уже пройден"
                : "ещё не начат"}
              ) — изменение вступит в силу после сохранения.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Shares this component's course state, so the list updates the moment
          the current lesson is saved. */}
      <LessonBoard
        groupName={groupName}
        title="Программа группы"
        lessons={lessons}
        currentLesson={currentLesson}
        total={total}
        status={status}
      />
    </div>
  );
}
