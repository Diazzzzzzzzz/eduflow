"use client";

import * as React from "react";
import { Bot, CalendarClock, CheckCircle2, Loader2 } from "lucide-react";
import { useApp } from "@/components/app-provider";
import { useGroups } from "@/components/groups/groups-provider";
import { BandChip } from "@/components/band-chip";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { formatDayMonthYear } from "@/lib/date";
import {
  SECTION_LABELS,
  submissionStatusMeta,
  type Homework,
  type Submission,
} from "@/lib/group-data";

function HomeworkCard({
  hw,
  submission,
  studentId,
  today,
}: {
  hw: Homework;
  submission: Submission | undefined;
  studentId: string;
  today: string;
}) {
  const { submitHomework } = useGroups();
  const [draft, setDraft] = React.useState(submission?.content ?? "");
  const [saving, setSaving] = React.useState(false);

  const meta = submission
    ? submissionStatusMeta(submission, hw, today)
    : { label: "Назначено", tone: "secondary" as const };

  const canSubmit =
    !submission || submission.status === "assigned";
  const graded = submission?.status === "graded";

  function submit() {
    if (!draft.trim()) return;
    setSaving(true);
    submitHomework(hw.id, studentId, draft.trim());
    setSaving(false);
  }

  return (
    <Card>
      <CardContent className="space-y-3 p-5">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <p className="font-medium">{hw.title}</p>
              <Badge variant="secondary">{SECTION_LABELS[hw.section]}</Badge>
            </div>
            <p className="mt-0.5 text-sm text-muted-foreground">{hw.description}</p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <Badge variant={meta.tone}>{meta.label}</Badge>
            {hw.dueDate && (
              <span className="tabular inline-flex items-center gap-1 text-xs text-muted-foreground">
                <CalendarClock className="h-3.5 w-3.5" /> до{" "}
                {formatDayMonthYear(hw.dueDate)}
              </span>
            )}
          </div>
        </div>

        {graded && submission && (
          <div className="space-y-2 rounded-lg border border-success/30 bg-success/5 p-3">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-sm font-medium text-success">
                <CheckCircle2 className="h-4 w-4" /> Проверено
              </span>
              {submission.band != null && <BandChip band={submission.band} size="sm" />}
            </div>
            {submission.feedback && (
              <p className="flex gap-2 text-sm text-muted-foreground">
                <Bot className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                {submission.feedback}
              </p>
            )}
          </div>
        )}

        {submission?.status === "submitted" && (
          <div className="rounded-lg border bg-secondary/40 p-3 text-sm">
            <p className="text-xs font-medium text-muted-foreground">Ваш ответ</p>
            <p className="mt-1">{submission.content}</p>
          </div>
        )}

        {canSubmit && (
          <div className="space-y-2">
            <Textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Введите ответ или вставьте текст работы…"
              className="min-h-[120px]"
              aria-label="Ответ на задание"
            />
            <div className="flex justify-end">
              <Button onClick={submit} disabled={saving || !draft.trim()}>
                {saving ? (
                  <>
                    <Loader2 className="animate-spin" /> Отправка…
                  </>
                ) : (
                  "Сдать работу"
                )}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function HomeworkList() {
  const { activeStudent } = useApp();
  const { homework, submissions } = useGroups();
  const [today, setToday] = React.useState("");

  React.useEffect(() => setToday(new Date().toISOString().slice(0, 10)), []);

  const mine = homework.filter((h) => h.groupName === activeStudent.group);

  return (
    <div className="space-y-4">
      <div className="animate-fade-up">
        <h2 className="font-display text-lg font-semibold">Мои домашние задания</h2>
        <p className="text-sm text-muted-foreground">
          Задания группы {activeStudent.group}. Сдавайте работы и смотрите отзыв
          преподавателя.
        </p>
      </div>

      {mine.length === 0 ? (
        <div className="rounded-lg border border-dashed py-12 text-center text-sm text-muted-foreground">
          Активных заданий нет.
        </div>
      ) : (
        <div className="space-y-3">
          {mine.map((hw) => (
            <HomeworkCard
              key={hw.id}
              hw={hw}
              submission={submissions.find(
                (s) => s.homeworkId === hw.id && s.studentId === activeStudent.id
              )}
              studentId={activeStudent.id}
              today={today}
            />
          ))}
        </div>
      )}
    </div>
  );
}
