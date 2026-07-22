"use client";

import * as React from "react";
import { Clock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { CambridgeTest } from "@/lib/cambridge-types";
import { ResultSummary } from "./result-summary";
import { useScoring } from "./use-scoring";

export function WritingEngine({ test }: { test: CambridgeTest }) {
  const tasks = test.passages;
  const [active, setActive] = React.useState(0);
  const { answers, setAnswer, submit, result, submitting, reset } =
    useScoring("writing");

  const task = tasks[active];
  const text = answers[task.id] ?? "";
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const minWords = active === 0 ? 150 : 250;
  const allotted = active === 0 ? "20:00" : "40:00";

  if (result) {
    return <ResultSummary result={result} onRetry={reset} />;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        {tasks.map((t, i) => (
          <button
            key={t.id}
            onClick={() => setActive(i)}
            className={cn(
              "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
              active === i
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground hover:text-foreground"
            )}
          >
            {t.title}
          </button>
        ))}
      </div>

      <Card>
        <CardContent className="space-y-1.5 p-5">
          <p className="text-xs font-medium uppercase tracking-wider text-primary">
            Задание · {task.title}
          </p>
          <p className="text-sm leading-relaxed">{task.textContent}</p>
        </CardContent>
      </Card>

      <div className="space-y-2">
        <Textarea
          value={text}
          onChange={(e) => setAnswer(task.id, e.target.value)}
          placeholder="Начните писать ответ здесь…"
          className="min-h-[280px] resize-y"
          aria-label="Текст ответа"
        />
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className={cn("tabular", words >= minWords && "text-success")}>
            {words} слов · минимум {minWords}
          </span>
          <span className="tabular inline-flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" /> {allotted}
          </span>
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={submit} disabled={submitting || words < 20}>
          {submitting ? (
            <>
              <Loader2 className="animate-spin" /> Отправка…
            </>
          ) : (
            "Отправить на проверку"
          )}
        </Button>
      </div>
    </div>
  );
}
