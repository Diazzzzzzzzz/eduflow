"use client";

import * as React from "react";
import { AlertTriangle, ArrowLeft, Flag, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { sectionQuestions } from "@/lib/exam/types";
import { useExamSession } from "./exam-session";

/**
 * The answer-sheet review screen: every question as a cell, coloured by
 * status, so a candidate can find what they skipped before submitting.
 */
export function ReviewPanel() {
  const {
    section,
    answers,
    flagged,
    answeredCount,
    totalQuestions,
    goToQuestion,
    closeReview,
    submit,
    phase,
    error,
  } = useExamSession();

  const [confirming, setConfirming] = React.useState(false);
  const questions = React.useMemo(() => sectionQuestions(section), [section]);
  const unanswered = questions.filter((q) => answers[q.id] === undefined);
  const flaggedList = questions.filter((q) => flagged.has(q.id));
  const submitting = phase === "submitting";

  return (
    <div className="mx-auto max-w-3xl space-y-5 py-2">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-bold">Проверка ответов</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Нажмите на номер, чтобы вернуться к вопросу.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={closeReview}>
          <ArrowLeft /> К тесту
        </Button>
      </div>

      {error && (
        <p className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          {error}
        </p>
      )}

      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="Отвечено" value={`${answeredCount} из ${totalQuestions}`} />
        <Stat
          label="Без ответа"
          value={String(unanswered.length)}
          tone={unanswered.length ? "warning" : "success"}
        />
        <Stat
          label="Отмечено"
          value={String(flaggedList.length)}
          tone={flaggedList.length ? "primary" : undefined}
        />
      </div>

      {section.passages.map((passage) => (
        <div key={passage.id} className="space-y-2">
          <p className="text-sm font-medium">
            Текст {passage.number}:{" "}
            <span className="text-muted-foreground">{passage.title}</span>
          </p>
          <div className="flex flex-wrap gap-1.5">
            {passage.groups
              .flatMap((g) => g.questions)
              .map((q) => {
                const done = answers[q.id] !== undefined;
                const isFlagged = flagged.has(q.id);
                const label = q.numberTo
                  ? `${q.number}–${q.numberTo}`
                  : String(q.number);
                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => goToQuestion(q.id)}
                    className={cn(
                      "tabular relative flex h-9 min-w-9 items-center justify-center rounded-md border px-1.5 text-xs font-semibold transition-all hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      done
                        ? "border-primary/40 bg-primary/10 text-primary"
                        : "border-dashed bg-card text-muted-foreground"
                    )}
                    aria-label={`Вопрос ${label}: ${
                      done ? "отвечен" : "без ответа"
                    }${isFlagged ? ", отмечен" : ""}`}
                  >
                    {label}
                    {isFlagged && (
                      <Flag className="absolute -right-1 -top-1 h-3 w-3 fill-warning text-warning" />
                    )}
                  </button>
                );
              })}
          </div>
        </div>
      ))}

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-secondary/40 p-4">
        <p className="text-sm text-muted-foreground">
          {unanswered.length === 0
            ? "Все вопросы заполнены."
            : `Без ответа ещё ${unanswered.length}. Пустые ответы засчитываются как неверные.`}
        </p>
        <Button onClick={() => setConfirming(true)} disabled={submitting}>
          {submitting ? (
            <>
              <Loader2 className="animate-spin" /> Отправка…
            </>
          ) : (
            <>
              <Send /> Завершить тест
            </>
          )}
        </Button>
      </div>

      <Dialog open={confirming} onOpenChange={setConfirming}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Завершить и проверить работу?</DialogTitle>
            <DialogDescription>
              После отправки вернуться к ответам будет нельзя. Вы увидите
              результат, разбор по каждому вопросу и итоговый балл.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 rounded-lg border bg-secondary/40 p-3 text-sm">
            <Row label="Отвечено" value={`${answeredCount} из ${totalQuestions}`} />
            {unanswered.length > 0 && (
              <Row
                label="Останутся пустыми"
                value={unanswered
                  .slice(0, 12)
                  .map((q) => q.number)
                  .join(", ")
                  .concat(unanswered.length > 12 ? "…" : "")}
                tone="warning"
              />
            )}
            {flaggedList.length > 0 && (
              <Row
                label="Отмечены для проверки"
                value={flaggedList.map((q) => q.number).join(", ")}
              />
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirming(false)}>
              Вернуться к ответам
            </Button>
            <Button
              onClick={() => {
                setConfirming(false);
                void submit();
              }}
            >
              <Send /> Отправить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "success" | "warning" | "primary";
}) {
  return (
    <div className="rounded-lg border bg-card p-3">
      <p className="text-xs uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p
        className={cn(
          "tabular mt-1 font-display text-lg font-bold",
          tone === "success" && "text-success",
          tone === "warning" && "text-warning",
          tone === "primary" && "text-primary"
        )}
      >
        {value}
      </p>
    </div>
  );
}

function Row({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "warning";
}) {
  return (
    <div className="flex justify-between gap-4">
      <span className="shrink-0 text-muted-foreground">{label}</span>
      <span
        className={cn("tabular text-right", tone === "warning" && "text-warning")}
      >
        {value}
      </span>
    </div>
  );
}
