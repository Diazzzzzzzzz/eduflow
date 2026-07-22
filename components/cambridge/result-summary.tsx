"use client";

import { Check, RotateCcw, X } from "lucide-react";
import { BandChip } from "@/components/band-chip";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { SubmissionResult } from "@/lib/cambridge-types";

export function ResultSummary({
  result,
  onRetry,
}: {
  result: SubmissionResult;
  onRetry: () => void;
}) {
  if (!result.scored) {
    return (
      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="flex items-center justify-between gap-4 p-5">
          <div>
            <p className="font-medium">Работа отправлена на проверку</p>
            <p className="text-sm text-muted-foreground">
              Преподаватель оценит ответ и оставит комментарий.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={onRetry}>
            <RotateCcw /> Заново
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="animate-fade-up">
      <CardContent className="space-y-4 p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Ваш результат
            </p>
            <p className="tabular mt-0.5 text-sm">
              Правильно {result.correct} из {result.total}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Балл</span>
            <BandChip band={result.band ?? 0} size="lg" />
          </div>
        </div>

        <ul className="space-y-2">
          {result.results.map((r) => (
            <li
              key={r.questionId}
              className="flex gap-3 rounded-lg border p-3 text-sm"
            >
              <span
                className={cn(
                  "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
                  r.correct
                    ? "bg-success/15 text-success"
                    : "bg-destructive/15 text-destructive"
                )}
              >
                {r.correct ? (
                  <Check className="h-3 w-3" />
                ) : (
                  <X className="h-3 w-3" />
                )}
              </span>
              <div className="space-y-0.5">
                <p className="font-medium">Вопрос {r.questionNumber}</p>
                <p className="text-muted-foreground">
                  Ваш ответ:{" "}
                  <span className="text-foreground">
                    {r.given || "— (пусто)"}
                  </span>
                  {!r.correct && (
                    <>
                      {" · "}Правильно:{" "}
                      <span className="text-success">
                        {r.correctAnswer.replace(/\|/g, " / ")}
                      </span>
                    </>
                  )}
                </p>
                {r.explanation && (
                  <p className="text-xs text-muted-foreground">
                    {r.explanation}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ul>

        <Button variant="outline" onClick={onRetry}>
          <RotateCcw /> Пройти заново
        </Button>
      </CardContent>
    </Card>
  );
}
