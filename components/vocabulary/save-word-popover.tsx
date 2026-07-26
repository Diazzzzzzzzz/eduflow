"use client";

import * as React from "react";
import { BookmarkPlus, Check, Languages, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export interface SaveWordTarget {
  /** The selected word or phrase. */
  term: string;
  /** Sentence the selection came from, stored as the example. */
  context: string;
  /** Position within the reader, in pixels relative to its container. */
  x: number;
  y: number;
}

interface Lookup {
  translation: string | null;
  phonetic: string | null;
  found: boolean;
  message?: string;
}

/**
 * Quick-translate and save, anchored to the current selection.
 *
 * Looks the word up on open so the common case is one click; when the glossary
 * has no entry the field is left empty and the student types their own, which
 * is both honest and better for retention than a guessed translation.
 */
export function SaveWordPopover({
  target,
  onSave,
  onClose,
}: {
  target: SaveWordTarget;
  onSave: (input: {
    term: string;
    translation: string;
    phonetic: string | null;
    example: string;
  }) => Promise<{ ok: boolean; error?: string; existed?: boolean }>;
  onClose: () => void;
}) {
  const [lookup, setLookup] = React.useState<Lookup | null>(null);
  const [translation, setTranslation] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [saved, setSaved] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    let cancelled = false;
    setLookup(null);
    setTranslation("");
    setError(null);
    setSaved(null);

    (async () => {
      try {
        const res = await fetch("/api/vocabulary/translate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: target.term }),
        });
        const body = (await res.json()) as Lookup & { error?: string };
        if (cancelled) return;
        if (!res.ok) {
          setLookup({ translation: null, phonetic: null, found: false });
          setError(body.error ?? null);
          return;
        }
        setLookup(body);
        if (body.translation) setTranslation(body.translation);
        else inputRef.current?.focus();
      } catch {
        if (!cancelled) {
          setLookup({ translation: null, phonetic: null, found: false });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [target.term]);

  async function submit() {
    if (!translation.trim()) {
      setError("Введите перевод");
      inputRef.current?.focus();
      return;
    }
    setSaving(true);
    setError(null);
    const res = await onSave({
      term: target.term,
      translation: translation.trim(),
      phonetic: lookup?.phonetic ?? null,
      example: target.context,
    });
    setSaving(false);
    if (!res.ok) {
      setError(res.error ?? "Не удалось сохранить");
      return;
    }
    setSaved(res.existed ? "Слово обновлено в словаре" : "Добавлено в словарь");
    setTimeout(onClose, 1200);
  }

  return (
    <div
      className="absolute z-30 w-[19rem] -translate-x-1/2 -translate-y-full pb-2"
      style={{ left: target.x, top: target.y }}
      role="dialog"
      aria-label={`Сохранить слово ${target.term}`}
    >
      <div className="animate-fade-up rounded-lg border bg-popover p-3 shadow-xl">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate font-display text-sm font-semibold">
              {target.term}
            </p>
            {lookup?.phonetic && (
              <p className="text-xs text-muted-foreground">{lookup.phonetic}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Закрыть"
            className="shrink-0 rounded-md p-0.5 text-muted-foreground transition-colors hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        {saved ? (
          <p className="mt-3 flex items-center gap-2 rounded-md border border-success/30 bg-success/10 px-2.5 py-2 text-sm text-success">
            <Check className="h-4 w-4 shrink-0" /> {saved}
          </p>
        ) : (
          <>
            <div className="mt-2.5 grid gap-1.5">
              <Label htmlFor="vocab-translation" className="text-xs">
                Перевод
              </Label>
              {lookup === null ? (
                <div className="flex h-9 items-center gap-2 rounded-md border px-3 text-xs text-muted-foreground">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Ищем перевод…
                </div>
              ) : (
                <Input
                  id="vocab-translation"
                  ref={inputRef}
                  value={translation}
                  onChange={(e) => setTranslation(e.target.value)}
                  placeholder="Введите перевод"
                  className="h-9"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") void submit();
                    if (e.key === "Escape") onClose();
                  }}
                />
              )}
              {lookup && !lookup.found && (
                <p className="flex items-start gap-1.5 text-[11px] text-muted-foreground">
                  <Languages className="mt-0.5 h-3 w-3 shrink-0" />
                  {lookup.message ?? "Перевода нет в словаре — введите свой."}
                </p>
              )}
            </div>

            {target.context && (
              <p className="mt-2 line-clamp-2 rounded-md bg-secondary/50 px-2 py-1.5 text-[11px] italic leading-relaxed text-muted-foreground">
                «{target.context}»
              </p>
            )}

            {error && (
              <p className="mt-2 text-xs text-destructive">{error}</p>
            )}

            <Button
              size="sm"
              className={cn("mt-2.5 w-full")}
              disabled={saving || lookup === null}
              onClick={() => void submit()}
            >
              {saving ? (
                <>
                  <Loader2 className="animate-spin" /> Сохранение…
                </>
              ) : (
                <>
                  <BookmarkPlus /> Сохранить в словарь
                </>
              )}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
