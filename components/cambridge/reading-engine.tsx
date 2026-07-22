"use client";

import * as React from "react";
import { Eraser, Highlighter, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { CambridgeTest } from "@/lib/cambridge-types";
import { QuestionView } from "./question-view";
import { ResultSummary } from "./result-summary";
import { useScoring } from "./use-scoring";

const FONT_SIZES = ["text-sm", "text-base", "text-lg", "text-xl"] as const;

export function ReadingEngine({ test }: { test: CambridgeTest }) {
  const passage = test.passages[0];
  const questions = test.passages.flatMap((p) => p.questions);
  const { answers, setAnswer, submit, result, submitting, reset } =
    useScoring("reading");

  const passageRef = React.useRef<HTMLDivElement>(null);
  const [fontIdx, setFontIdx] = React.useState(1);

  function highlightSelection() {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || !passageRef.current) return;
    const range = sel.getRangeAt(0);
    if (!passageRef.current.contains(range.commonAncestorContainer)) return;
    const mark = document.createElement("mark");
    mark.className = "rounded bg-warning/25 px-0.5";
    try {
      range.surroundContents(mark);
      sel.removeAllRanges();
    } catch {
      // Selection spans multiple nodes — skip (best-effort highlight).
    }
  }

  function clearHighlights() {
    passageRef.current?.querySelectorAll("mark").forEach((m) => {
      const parent = m.parentNode;
      if (!parent) return;
      while (m.firstChild) parent.insertBefore(m.firstChild, m);
      parent.removeChild(m);
      parent.normalize();
    });
  }

  const paragraphs = passage.textContent.split(/\n\n+/);
  const done = !!result;

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {/* Passage */}
      <Card className="lg:sticky lg:top-24 lg:max-h-[calc(100vh-9rem)] lg:overflow-auto">
        <CardContent className="space-y-3 p-5">
          <div className="flex items-center justify-between gap-2">
            <Badge variant="secondary">Текст {passage.passageNumber}</Badge>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7"
                aria-label="Уменьшить шрифт"
                onClick={() => setFontIdx((i) => Math.max(0, i - 1))}
              >
                <span className="text-xs">A−</span>
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7"
                aria-label="Увеличить шрифт"
                onClick={() =>
                  setFontIdx((i) => Math.min(FONT_SIZES.length - 1, i + 1))
                }
              >
                <span className="text-sm">A+</span>
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7"
                aria-label="Выделить фрагмент"
                onClick={highlightSelection}
              >
                <Highlighter className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7"
                aria-label="Убрать выделение"
                onClick={clearHighlights}
              >
                <Eraser className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
          <h3 className="font-display text-lg font-semibold">{passage.title}</h3>
          <div
            ref={passageRef}
            className={cn(
              "space-y-3 leading-relaxed text-muted-foreground",
              FONT_SIZES[fontIdx]
            )}
          >
            {paragraphs.map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
          <p className="pt-2 text-xs text-muted-foreground/70">
            Выделите текст курсором и нажмите значок маркера, чтобы подсветить.
          </p>
        </CardContent>
      </Card>

      {/* Questions */}
      <div className="space-y-4">
        {done && result && <ResultSummary result={result} onRetry={reset} />}
        {!done && (
          <Card>
            <CardContent className="space-y-5 p-5">
              <p className="text-sm font-medium">
                Вопросы 1–{questions.length}
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
    </div>
  );
}
