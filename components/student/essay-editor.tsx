"use client";

import * as React from "react";
import { AlertTriangle, Check, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { countEssayWords } from "@/lib/group-data";

/**
 * Essay composer for a Writing task.
 *
 * Drafts autosave locally, because losing twenty minutes of typing to a stray
 * refresh is the fastest way to make a student stop using the portal.
 */
export function EssayEditor({
  homeworkId,
  studentId,
  prompt,
  minWords = 250,
  initialContent = "",
  onSubmit,
}: {
  homeworkId: string;
  studentId: string;
  prompt: string;
  minWords?: number;
  initialContent?: string;
  onSubmit: (content: string) => void | Promise<void>;
}) {
  const storageKey = `eduflow:essay:${homeworkId}:${studentId}`;
  const [text, setText] = React.useState(initialContent);
  const [restored, setRestored] = React.useState(false);
  const [savedAt, setSavedAt] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved && !initialContent) setText(saved);
    } catch {
      // Private mode — the editor still works, just without a saved draft.
    }
    setRestored(true);
  }, [storageKey, initialContent]);

  React.useEffect(() => {
    if (!restored) return;
    const id = window.setTimeout(() => {
      try {
        localStorage.setItem(storageKey, text);
        if (text.trim()) {
          setSavedAt(
            new Date().toLocaleTimeString("ru-RU", {
              hour: "2-digit",
              minute: "2-digit",
            })
          );
        }
      } catch {
        // Ignore quota failures.
      }
    }, 800);
    return () => window.clearTimeout(id);
  }, [text, restored, storageKey]);

  const words = countEssayWords(text);
  const short = words > 0 && words < minWords;
  const progress = Math.min((words / minWords) * 100, 100);

  const [error, setError] = React.useState<string | null>(null);

  /**
   * Submitting is a network write now, so the local draft is only discarded
   * once the server has accepted the essay — clearing it first would lose the
   * student's work if the request failed.
   */
  async function submit() {
    if (!text.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit(text.trim());
      try {
        localStorage.removeItem(storageKey);
      } catch {
        // Nothing to clean up.
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Не удалось отправить работу."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-primary/25 bg-primary/5 p-3">
        <p className="text-xs font-medium uppercase tracking-wider text-primary">
          Задание
        </p>
        <p className="mt-1 text-sm leading-relaxed">{prompt}</p>
        <p className="tabular mt-2 text-xs text-muted-foreground">
          Минимум {minWords} слов · рекомендуемое время 40 минут
        </p>
      </div>

      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Напишите эссе здесь…"
        className="min-h-[320px] leading-7"
        aria-label="Текст эссе"
      />

      <div className="space-y-1.5">
        <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
          <div
            className={cn(
              "h-full rounded-full transition-[width] duration-300",
              words >= minWords ? "bg-success" : "bg-primary"
            )}
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span
            className={cn(
              "tabular text-xs",
              words >= minWords ? "text-success" : "text-muted-foreground"
            )}
          >
            {words} / {minWords} слов
            {words >= minWords && " — норма выполнена"}
          </span>
          {savedAt && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Save className="h-3 w-3" /> черновик сохранён в {savedAt}
            </span>
          )}
        </div>
      </div>

      {short && (
        <p className="flex items-start gap-2 rounded-md border border-warning/30 bg-warning/5 px-3 py-2 text-xs text-warning">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          Эссе короче {minWords} слов. На экзамене за недобор объёма снижают балл
          по Task Achievement — работу можно сдать, но лучше дописать.
        </p>
      )}

      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="flex justify-end">
        <Button onClick={submit} disabled={submitting || !text.trim()}>
          {submitting ? (
            <>
              <Loader2 className="animate-spin" /> Отправка…
            </>
          ) : (
            <>
              <Check /> Сдать эссе
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
