"use client";

import * as React from "react";
import { Check, FileText, Info } from "lucide-react";
import { useGroups } from "@/components/groups/groups-provider";
import { BandChip } from "@/components/band-chip";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { formatBand } from "@/lib/band";
import {
  countEssayWords,
  criteriaToBand,
  CRITERION_STEPS,
  WRITING_CRITERIA,
  type Homework,
  type Submission,
  type WritingCriteria,
} from "@/lib/group-data";

const BLANK: Partial<WritingCriteria> = {};

/**
 * Essay review: the marker reads the script on the left and applies the four
 * IELTS Writing criteria on the right. The overall band is derived, never typed,
 * so it always matches the criteria actually awarded.
 */
export function EssayReviewDialog({
  submission,
  homework,
  studentName,
  onClose,
}: {
  submission: Submission | null;
  homework: Homework | null;
  studentName: string;
  onClose: () => void;
}) {
  const { gradeSubmission } = useGroups();
  const [marks, setMarks] = React.useState<Partial<WritingCriteria>>(BLANK);
  const [feedback, setFeedback] = React.useState("");

  React.useEffect(() => {
    setMarks(submission?.criteria ?? BLANK);
    setFeedback(submission?.feedback ?? "");
  }, [submission?.id, submission?.criteria, submission?.feedback]);

  const complete = WRITING_CRITERIA.every(
    (c) => typeof marks[c.key] === "number"
  );
  const band = complete ? criteriaToBand(marks as WritingCriteria) : null;
  const words = countEssayWords(submission?.content ?? "");
  const minWords = homework?.minWords ?? 250;
  const short = words > 0 && words < minWords;

  return (
    <Dialog open={!!submission} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-5xl">
        {submission && (
          <>
            <DialogHeader>
              <DialogTitle>Проверка эссе</DialogTitle>
              <DialogDescription>
                {studentName}
                {homework ? ` · ${homework.title}` : ""}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
              {/* Script */}
              <div className="flex min-h-0 flex-col rounded-lg border">
                <div className="flex items-center justify-between gap-2 border-b bg-secondary/40 px-3 py-2">
                  <span className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    <FileText className="h-3.5 w-3.5" /> Работа студента
                  </span>
                  <span
                    className={cn(
                      "tabular rounded-full border px-2 py-0.5 text-xs",
                      short
                        ? "border-warning/40 bg-warning/10 text-warning"
                        : "text-muted-foreground"
                    )}
                  >
                    {words} слов
                    {short && ` · меньше ${minWords}`}
                  </span>
                </div>

                {homework?.description && (
                  <p className="border-b bg-primary/5 px-3 py-2 text-xs italic leading-relaxed text-muted-foreground">
                    {homework.description}
                  </p>
                )}

                <div className="slim-scroll max-h-[46vh] overflow-y-auto px-4 py-3">
                  {submission.content ? (
                    <p className="whitespace-pre-wrap text-sm leading-7">
                      {submission.content}
                    </p>
                  ) : (
                    <p className="py-8 text-center text-sm text-muted-foreground">
                      Студент ещё не отправил работу.
                    </p>
                  )}
                </div>
              </div>

              {/* Marking */}
              <div className="space-y-3">
                <div className="space-y-2.5">
                  {WRITING_CRITERIA.map((c) => (
                    <div key={c.key} className="grid gap-1.5">
                      <div className="flex items-baseline justify-between gap-2">
                        <Label htmlFor={`crit-${c.key}`} className="text-sm">
                          {c.label}
                        </Label>
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                          {c.short}
                        </span>
                      </div>
                      <Select
                        value={
                          typeof marks[c.key] === "number"
                            ? String(marks[c.key])
                            : undefined
                        }
                        onValueChange={(v) =>
                          setMarks((m) => ({ ...m, [c.key]: Number(v) }))
                        }
                      >
                        <SelectTrigger id={`crit-${c.key}`}>
                          <SelectValue placeholder="—" />
                        </SelectTrigger>
                        <SelectContent>
                          {CRITERION_STEPS.map((step) => (
                            <SelectItem key={step} value={String(step)}>
                              {formatBand(step)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">{c.hint}</p>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between rounded-lg border bg-secondary/40 px-3 py-2.5">
                  <div>
                    <p className="text-sm font-medium">Итоговый балл</p>
                    <p className="text-xs text-muted-foreground">
                      Среднее по четырём критериям
                    </p>
                  </div>
                  {band !== null ? (
                    <BandChip band={band} size="lg" />
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      Оцените все критерии
                    </span>
                  )}
                </div>

                <div className="grid gap-1.5">
                  <Label htmlFor="essay-feedback">Комментарий для студента</Label>
                  <Textarea
                    id="essay-feedback"
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Что удалось, что исправить в следующей работе…"
                    className="min-h-[110px]"
                  />
                </div>

                <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
                  <Info className="mt-0.5 h-3 w-3 shrink-0" />
                  Балл считается как среднее и округляется до ближайшей половины —
                  как в официальных дескрипторах.
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={onClose}>
                Отмена
              </Button>
              <Button
                disabled={!complete}
                onClick={() => {
                  gradeSubmission(
                    submission.id,
                    criteriaToBand(marks as WritingCriteria),
                    feedback.trim(),
                    marks as WritingCriteria
                  );
                  onClose();
                }}
              >
                <Check /> Сохранить оценку
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
