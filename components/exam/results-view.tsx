"use client";

import * as React from "react";
import { Check, ChevronDown, RotateCcw, Ruler, X } from "lucide-react";
import { BandChip } from "@/components/band-chip";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { ExamResult, ExamSection } from "@/lib/exam/types";
import { sectionQuestions } from "@/lib/exam/types";

function formatDuration(seconds?: number): string | null {
  if (seconds === undefined) return null;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m} мин ${s} с` : `${s} с`;
}

export function ResultsView({
  section,
  result,
  onRestart,
}: {
  section: ExamSection;
  result: ExamResult;
  onRestart: () => void;
}) {
  const [filter, setFilter] = React.useState<"all" | "wrong">("wrong");
  const [expanded, setExpanded] = React.useState<string | null>(null);

  // Prompts live on the public section, results carry only ids — join them.
  const prompts = React.useMemo(() => {
    const map = new Map<string, string>();
    for (const q of sectionQuestions(section)) map.set(q.id, q.prompt);
    return map;
  }, [section]);

  const wrong = result.results.filter((r) => !r.correct);
  const shown = filter === "wrong" ? wrong : result.results;
  const duration = formatDuration(result.durationSeconds);
  const pct = Math.round((result.correct / Math.max(result.total, 1)) * 100);

  return (
    <div className="mx-auto max-w-3xl space-y-5 py-2">
      {/* Score header */}
      <Card className="animate-fade-up overflow-hidden">
        <div className="border-b bg-secondary/40 px-6 py-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Результат · {section.title}
              </p>
              <p className="tabular mt-1 font-display text-2xl font-bold">
                {result.correct} из {result.total}
                <span className="ml-2 text-base font-medium text-muted-foreground">
                  ({pct}%)
                </span>
              </p>
              {duration && (
                <p className="mt-1 text-xs text-muted-foreground">
                  Время в работе: {duration}
                </p>
              )}
            </div>
            <div className="text-right">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Band score
              </p>
              <BandChip band={result.band} size="lg" className="mt-1" />
            </div>
          </div>
        </div>

        <CardContent className="space-y-3 p-5">
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Ruler className="h-3.5 w-3.5" />
            Балл рассчитан по официальной таблице перевода Academic{" "}
            {section.skill === "listening" ? "Listening" : "Reading"}.
          </p>
          {result.byPassage.map((p) => (
            <div key={p.number} className="space-y-1">
              <div className="flex items-baseline justify-between gap-3 text-sm">
                <span className="truncate">
                  Текст {p.number}:{" "}
                  <span className="text-muted-foreground">{p.title}</span>
                </span>
                <span className="tabular shrink-0 font-medium">
                  {p.correct}/{p.total}
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
                <div
                  className={cn(
                    "h-full rounded-full transition-[width] duration-700",
                    p.correct / p.total >= 0.75
                      ? "bg-success"
                      : p.correct / p.total >= 0.5
                        ? "bg-primary"
                        : "bg-warning"
                  )}
                  style={{ width: `${(p.correct / Math.max(p.total, 1)) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Answer review */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-display text-lg font-semibold">Разбор ответов</h3>
        <div className="flex items-center gap-1 rounded-lg bg-secondary p-1">
          {(
            [
              ["wrong", `Ошибки (${wrong.length})`],
              ["all", `Все (${result.results.length})`],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key)}
              className={cn(
                "rounded-md px-3 py-1 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                filter === key
                  ? "bg-card text-foreground shadow"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {shown.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-10 text-center">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-success/15 text-success">
              <Check className="h-5 w-5" />
            </span>
            <p className="font-medium">Ошибок нет</p>
            <p className="text-sm text-muted-foreground">
              Все ответы верные. Переключитесь на «Все», чтобы просмотреть разбор.
            </p>
          </CardContent>
        </Card>
      ) : (
        <ul className="space-y-2">
          {shown.map((r) => {
            const label = r.numberTo ? `${r.number}–${r.numberTo}` : r.number;
            const given = Array.isArray(r.given) ? r.given.join(", ") : r.given;
            const open = expanded === r.questionId;
            const partial = r.earned > 0 && r.earned < r.possible;
            return (
              <li key={r.questionId}>
                <div
                  className={cn(
                    "rounded-lg border p-3",
                    r.correct
                      ? "border-success/30 bg-success/5"
                      : partial
                        ? "border-warning/30 bg-warning/5"
                        : "border-destructive/25 bg-destructive/5"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={cn(
                        "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
                        r.correct
                          ? "bg-success/20 text-success"
                          : "bg-destructive/15 text-destructive"
                      )}
                    >
                      {r.correct ? (
                        <Check className="h-3 w-3" />
                      ) : (
                        <X className="h-3 w-3" />
                      )}
                    </span>
                    <div className="min-w-0 flex-1 space-y-1">
                      <p className="text-sm font-medium">
                        <span className="tabular">{label}.</span>{" "}
                        {prompts.get(r.questionId)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Ваш ответ:{" "}
                        <span
                          className={cn(
                            "font-medium",
                            r.correct ? "text-success" : "text-foreground"
                          )}
                        >
                          {given || "— не отвечено"}
                        </span>
                        {!r.correct && (
                          <>
                            {" · "}Верно:{" "}
                            <span className="font-medium text-success">
                              {r.answer}
                            </span>
                          </>
                        )}
                      </p>
                      {r.overWordLimit && (
                        <p className="text-xs font-medium text-warning">
                          Ответ превысил лимит слов — на экзамене такой ответ не
                          засчитывается.
                        </p>
                      )}
                      {partial && (
                        <p className="tabular text-xs text-warning">
                          Засчитано {r.earned} из {r.possible} баллов.
                        </p>
                      )}
                      {r.explanation && (
                        <>
                          <button
                            type="button"
                            onClick={() =>
                              setExpanded(open ? null : r.questionId)
                            }
                            aria-expanded={open}
                            className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                          >
                            Почему так
                            <ChevronDown
                              className={cn(
                                "h-3 w-3 transition-transform",
                                open && "rotate-180"
                              )}
                            />
                          </button>
                          {open && (
                            <p className="rounded-md bg-card px-3 py-2 text-xs leading-relaxed text-muted-foreground">
                              {r.explanation}
                            </p>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <div className="flex justify-center pt-2">
        <Button variant="outline" onClick={onRestart}>
          <RotateCcw /> Пройти заново
        </Button>
      </div>
    </div>
  );
}
