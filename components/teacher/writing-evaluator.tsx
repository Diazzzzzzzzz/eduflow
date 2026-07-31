"use client";

import * as React from "react";
import { Loader2, Sparkles } from "lucide-react";
import { BandChip } from "@/components/band-chip";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { WritingEvaluation } from "@/lib/types";

const CRITERIA: { key: keyof WritingEvaluation & string; label: string }[] = [
  { key: "taskAchievement", label: "Выполнение задания" },
  { key: "coherence", label: "Связность и логичность" },
  { key: "lexical", label: "Словарный запас" },
  { key: "grammar", label: "Грамматика" },
];

export function WritingEvaluator() {
  const [essay, setEssay] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [result, setResult] = React.useState<WritingEvaluation | null>(null);

  const [error, setError] = React.useState<string | null>(null);

  // Real model call now: this used to render a fixed sample after a fake
  // 1.5s delay, so every essay scored 6.5 regardless of content.
  async function analyze() {
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const res = await fetch("/api/ai/evaluate-writing", {
        method: "POST",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ essay }),
      });
      const json = (await res.json()) as {
        evaluation?: WritingEvaluation;
        error?: string;
      };
      if (!res.ok || !json.evaluation) {
        throw new Error(json.error || "Не удалось оценить работу.");
      }
      setResult(json.evaluation);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Не удалось оценить работу."
      );
    } finally {
      setLoading(false);
    }
  }

  const words = essay.trim() ? essay.trim().split(/\s+/).length : 0;

  return (
    <Card className="animate-fade-up" style={{ animationDelay: "320ms" }}>
      <CardHeader className="flex-row flex-wrap items-end justify-between gap-3 space-y-0">
        <div className="space-y-1.5">
          <CardTitle className="flex items-center gap-2 font-display">
            <Sparkles className="h-4 w-4 text-primary" />
            AI-оценка письма
          </CardTitle>
          <CardDescription>
            Вставьте эссе Task 2, чтобы получить оценку по четырём критериям.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="grid gap-5 lg:grid-cols-2">
        <div className="space-y-3">
          <Textarea
            value={essay}
            onChange={(e) => setEssay(e.target.value)}
            placeholder="Вставьте эссе студента… (не менее 250 слов)"
            className="min-h-[220px] resize-y"
            aria-label="Essay text"
          />
          <div className="flex items-center justify-between">
            <span className="tabular text-xs text-muted-foreground">
              {words} слов
            </span>
            <Button onClick={analyze} disabled={loading || words < 20}>
              {loading ? (
                <>
                  <Loader2 className="animate-spin" /> Анализ…
                </>
              ) : (
                <>
                  <Sparkles /> Быстрый анализ
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="rounded-lg border bg-secondary/40 p-4">
          {loading ? (
            <div className="space-y-3" aria-live="polite" aria-busy>
              <Skeleton className="h-5 w-40" />
              <div className="grid grid-cols-2 gap-3">
                {CRITERIA.map((c) => (
                  <Skeleton key={c.key} className="h-14" />
                ))}
              </div>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/6" />
            </div>
          ) : result ? (
            <div className="space-y-4 animate-fade-up" aria-live="polite">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Оценка по критериям</p>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Общий</span>
                  <BandChip band={result.overall} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {CRITERIA.map((c) => (
                  <div
                    key={c.key}
                    className="flex items-center justify-between rounded-md border bg-card px-3 py-2.5"
                  >
                    <span className="pr-2 text-xs text-muted-foreground">
                      {c.label}
                    </span>
                    <BandChip band={result[c.key] as number} size="sm" />
                  </div>
                ))}
              </div>
              <ul className="space-y-2">
                {result.feedback.map((f, i) => (
                  <li key={i} className="flex gap-2 text-sm">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    <span className="text-muted-foreground">{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="flex h-full min-h-[220px] flex-col items-center justify-center gap-2 text-center">
              <Sparkles
                className={cn(
                  "h-6 w-6",
                  error ? "text-destructive" : "text-muted-foreground"
                )}
              />
              {error ? (
                <>
                  <p className="text-sm font-medium text-destructive">
                    Оценка не выполнена
                  </p>
                  <p role="alert" className="max-w-[30ch] text-xs text-destructive">
                    {error}
                  </p>
                </>
              ) : (
                <>
                  <p className="text-sm font-medium">Анализа пока нет</p>
                  <p className="max-w-[26ch] text-xs text-muted-foreground">
                    Вставьте эссе и нажмите «Быстрый анализ», чтобы увидеть баллы
                    и комментарии.
                  </p>
                </>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
