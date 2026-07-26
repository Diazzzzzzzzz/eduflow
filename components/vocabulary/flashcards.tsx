"use client";

import * as React from "react";
import {
  ArrowLeft,
  Check,
  RotateCcw,
  RotateCw,
  Trophy,
  Volume2,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useSpeech } from "@/lib/use-vocabulary";
import {
  advanceStatus,
  STATUS_LABELS,
  type VocabEntry,
  type VocabStatus,
} from "@/lib/vocabulary-data";

interface Result {
  entry: VocabEntry;
  knew: boolean;
}

/**
 * Flashcard drill.
 *
 * A miss puts the card back at the end of the queue, so a session finishes only
 * when every word has been recalled at least once — the point is to leave with
 * the whole set fresh, not to walk past the hard ones.
 */
export function Flashcards({
  entries,
  onStatusChange,
  onExit,
}: {
  entries: VocabEntry[];
  onStatusChange: (id: string, status: VocabStatus) => void;
  onExit: () => void;
}) {
  const [queue, setQueue] = React.useState<VocabEntry[]>(() => entries);
  const [index, setIndex] = React.useState(0);
  const [flipped, setFlipped] = React.useState(false);
  const [results, setResults] = React.useState<Result[]>([]);
  const { speak, supported } = useSpeech();

  const total = entries.length;
  const current = queue[index];
  const done = index >= queue.length;

  function answer(knew: boolean) {
    if (!current) return;
    const next = advanceStatus(current.status, knew);
    onStatusChange(current.id, next);
    setResults((prev) => [...prev, { entry: current, knew }]);

    // Missed cards come round again before the session can end.
    if (!knew) setQueue((q) => [...q, current]);

    setFlipped(false);
    setIndex((i) => i + 1);
  }

  function restart() {
    setQueue(entries);
    setIndex(0);
    setFlipped(false);
    setResults([]);
  }

  // Keyboard: space flips, arrows answer — quicker than reaching for the mouse.
  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (done) return;
      if (e.code === "Space") {
        e.preventDefault();
        setFlipped((f) => !f);
      }
      if (!flipped) return;
      if (e.key === "ArrowRight") answer(true);
      if (e.key === "ArrowLeft") answer(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (total === 0) {
    return (
      <Card className="mx-auto max-w-md">
        <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
          <p className="font-medium">Нет слов для тренировки</p>
          <p className="text-sm text-muted-foreground">
            Добавьте слова в словарь или снимите фильтр.
          </p>
          <Button variant="outline" size="sm" onClick={onExit}>
            <ArrowLeft /> К словарю
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (done) {
    const known = results.filter((r) => r.knew).length;
    const missed = results.filter((r) => !r.knew);
    return (
      <div className="mx-auto max-w-xl space-y-4">
        <Card className="animate-fade-up">
          <CardContent className="space-y-4 p-6 text-center">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-success/10 text-success">
              <Trophy className="h-6 w-6" />
            </span>
            <div>
              <p className="font-display text-xl font-bold">Сессия завершена</p>
              <p className="tabular mt-1 text-sm text-muted-foreground">
                {known} из {results.length} ответов — знал сразу
              </p>
            </div>

            {missed.length > 0 && (
              <div className="rounded-lg border bg-secondary/40 p-3 text-left">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Стоит повторить
                </p>
                <ul className="mt-2 flex flex-wrap gap-1.5">
                  {Array.from(new Set(missed.map((m) => m.entry.term))).map(
                    (term) => (
                      <li key={term}>
                        <Badge variant="warning">{term}</Badge>
                      </li>
                    )
                  )}
                </ul>
              </div>
            )}

            <div className="flex flex-wrap justify-center gap-2">
              <Button onClick={restart}>
                <RotateCcw /> Пройти заново
              </Button>
              <Button variant="outline" onClick={onExit}>
                <ArrowLeft /> К словарю
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const progress = Math.round((index / queue.length) * 100);

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <div className="flex items-center justify-between gap-3">
        <Button variant="outline" size="sm" onClick={onExit}>
          <ArrowLeft /> К словарю
        </Button>
        <span className="tabular text-sm text-muted-foreground">
          Карточка {index + 1} из {queue.length}
        </span>
      </div>

      <Progress value={progress} aria-label={`Прогресс: ${progress}%`} />

      {/* Card */}
      <div className="flip-scene">
        <button
          type="button"
          onClick={() => setFlipped((f) => !f)}
          aria-label={flipped ? "Показать слово" : "Показать перевод"}
          className={cn(
            "flip-card block w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            flipped && "is-flipped"
          )}
        >
          {/* Front */}
          <Card className="flip-face min-h-[17rem] shadow-card">
            <CardContent className="flex min-h-[17rem] flex-col items-center justify-center gap-3 p-6 text-center">
              <Badge variant="secondary">
                {STATUS_LABELS[current.status]}
              </Badge>
              <p className="font-display text-3xl font-bold tracking-tight">
                {current.term}
              </p>
              {current.phonetic && (
                <p className="text-sm text-muted-foreground">
                  {current.phonetic}
                </p>
              )}
              {supported && (
                <span
                  role="button"
                  tabIndex={0}
                  onClick={(e) => {
                    e.stopPropagation();
                    speak(current.term);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.stopPropagation();
                      e.preventDefault();
                      speak(current.term);
                    }
                  }}
                  aria-label={`Озвучить ${current.term}`}
                  className="mt-1 inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors hover:bg-primary/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Volume2 className="h-4 w-4" />
                </span>
              )}
              <p className="mt-2 text-xs text-muted-foreground">
                Нажмите на карточку или пробел, чтобы перевернуть
              </p>
            </CardContent>
          </Card>

          {/* Back */}
          <Card className="flip-face flip-face-back min-h-[17rem] border-primary/30 bg-primary/5 shadow-card">
            <CardContent className="flex min-h-[17rem] flex-col items-center justify-center gap-2.5 p-6 text-center">
              <p className="font-display text-2xl font-bold text-primary">
                {current.translation}
              </p>
              {current.phonetic && (
                <p className="text-sm text-muted-foreground">
                  {current.phonetic}
                </p>
              )}
              {current.example && (
                <p className="mt-2 max-w-sm text-sm italic leading-relaxed text-muted-foreground">
                  «{current.example}»
                </p>
              )}
              {current.topic && (
                <Badge variant="secondary" className="mt-1">
                  {current.topic}
                </Badge>
              )}
            </CardContent>
          </Card>
        </button>
      </div>

      {/* Answer controls appear only once the answer is visible. */}
      <div
        className={cn(
          "grid grid-cols-2 gap-3 transition-opacity duration-200",
          flipped ? "opacity-100" : "pointer-events-none opacity-40"
        )}
      >
        <Button
          variant="outline"
          className="h-12 border-warning/40 text-warning hover:bg-warning/10"
          disabled={!flipped}
          onClick={() => answer(false)}
        >
          <X /> Не знаю
        </Button>
        <Button
          variant="success"
          className="h-12"
          disabled={!flipped}
          onClick={() => answer(true)}
        >
          <Check /> Знаю
        </Button>
      </div>

      <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
        <RotateCw className="h-3 w-3" />
        Пробел — перевернуть, ← не знаю, → знаю
      </p>
    </div>
  );
}
