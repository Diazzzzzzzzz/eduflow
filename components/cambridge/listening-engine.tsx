"use client";

import * as React from "react";
import { Loader2, Pause, Play, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { CambridgeTest } from "@/lib/cambridge-types";
import { QuestionView } from "./question-view";
import { ResultSummary } from "./result-summary";
import { useScoring } from "./use-scoring";

export function ListeningEngine({ test }: { test: CambridgeTest }) {
  const passage = test.passages[0];
  const questions = test.passages.flatMap((p) => p.questions);
  const { answers, setAnswer, submit, result, submitting, reset } =
    useScoring("listening");
  const [playing, setPlaying] = React.useState(false);
  const done = !!result;

  return (
    <div className="space-y-4">
      {/* Audio player (sticky) */}
      <Card className="sticky top-20 z-10">
        <CardContent className="space-y-2 p-4">
          {passage.audioUrl ? (
            <audio
              controls
              src={passage.audioUrl}
              className="w-full"
              aria-label="Аудио задания"
            />
          ) : (
            <div className="flex items-center gap-3 rounded-lg border bg-secondary/40 p-3">
              <Button
                size="icon"
                onClick={() => setPlaying((v) => !v)}
                aria-label={playing ? "Пауза" : "Воспроизвести"}
              >
                {playing ? <Pause /> : <Play />}
              </Button>
              <div className="flex-1">
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-border">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: playing ? "40%" : "6%" }}
                  />
                </div>
                <p className="tabular mt-1.5 text-xs text-muted-foreground">
                  {playing ? "01:52" : "00:00"} / 05:00 · демонстрационное аудио
                </p>
              </div>
              <Volume2 className="h-4 w-4 text-muted-foreground" />
            </div>
          )}
          <p className="text-xs text-muted-foreground">{passage.textContent}</p>
        </CardContent>
      </Card>

      {done && result && <ResultSummary result={result} onRetry={reset} />}

      {!done && (
        <Card>
          <CardContent className="space-y-5 p-5">
            <p className="text-sm font-medium">
              {passage.title} · вопросы 1–{questions.length}
            </p>
            {questions.map((q) => (
              <QuestionView
                key={q.id}
                q={q}
                value={answers[q.id] ?? ""}
                onChange={(v) => setAnswer(q.id, v)}
                disabled={submitting}
              />
            ))}
            <Button onClick={submit} disabled={submitting} className="w-full">
              {submitting ? (
                <>
                  <Loader2 className="animate-spin" /> Проверка…
                </>
              ) : (
                "Завершить и проверить"
              )}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
