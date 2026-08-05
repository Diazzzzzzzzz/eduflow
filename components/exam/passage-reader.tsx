"use client";

import * as React from "react";
import {
  BookmarkPlus,
  Highlighter,
  Languages,
  StickyNote,
  Trash2,
  Type,
} from "lucide-react";
import { useApp } from "@/components/app-provider";
import {
  SaveWordPopover,
  type SaveWordTarget,
} from "@/components/vocabulary/save-word-popover";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { sentenceAround } from "@/lib/vocabulary-data";
import type { ExamPassage } from "@/lib/exam/types";
import { useExamSession, type Highlight } from "./exam-session";

const FONT_STEPS = [
  { cls: "text-[15px] leading-7", label: "S" },
  { cls: "text-base leading-8", label: "M" },
  { cls: "text-lg leading-8", label: "L" },
  { cls: "text-xl leading-9", label: "XL" },
] as const;

interface Paragraph {
  label: string | null;
  body: string;
}

/** Split the passage into paragraphs, pulling out a leading `[A]` marker. */
function parseParagraphs(text: string): Paragraph[] {
  return text
    .split(/\n\s*\n/)
    .map((raw) => raw.trim())
    .filter(Boolean)
    .map((raw) => {
      const match = raw.match(/^\[([A-Z])\]\s*/);
      return match
        ? { label: match[1], body: raw.slice(match[0].length) }
        : { label: null, body: raw };
    });
}

/** Character offset of a DOM position within a container's text content. */
function offsetIn(
  container: HTMLElement,
  node: Node,
  nodeOffset: number
): number | null {
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
  let total = 0;
  let current: Node | null = walker.nextNode();
  while (current) {
    if (current === node) return total + nodeOffset;
    total += current.textContent?.length ?? 0;
    current = walker.nextNode();
  }
  // The endpoint sat on an element rather than a text node.
  return container.contains(node) ? total : null;
}

/** Slice a paragraph into plain and highlighted runs. */
function segment(
  body: string,
  marks: Highlight[]
): { text: string; hl?: Highlight }[] {
  const sorted = [...marks].sort((a, b) => a.start - b.start);
  const out: { text: string; hl?: Highlight }[] = [];
  let pos = 0;
  for (const m of sorted) {
    const start = Math.max(pos, Math.min(m.start, body.length));
    const end = Math.max(start, Math.min(m.end, body.length));
    if (start > pos) out.push({ text: body.slice(pos, start) });
    if (end > start) out.push({ text: body.slice(start, end), hl: m });
    pos = end;
  }
  if (pos < body.length) out.push({ text: body.slice(pos) });
  return out;
}

interface PendingSelection {
  para: number;
  start: number;
  end: number;
  quote: string;
  x: number;
  y: number;
}

export function PassageReader({
  passage,
  scrollRef,
}: {
  passage: ExamPassage;
  /** Exposed so the shell can link this pane's scrolling to the question pane. */
  scrollRef?: React.RefObject<HTMLDivElement>;
}) {
  const { highlights, addHighlight, removeHighlight, setNote } =
    useExamSession();
  const [fontIdx, setFontIdx] = React.useState(1);
  const [pending, setPending] = React.useState<PendingSelection | null>(null);
  const [editingNote, setEditingNote] = React.useState<string | null>(null);
  const [showNotes, setShowNotes] = React.useState(false);
  const [vocabTarget, setVocabTarget] = React.useState<SaveWordTarget | null>(
    null
  );
  /** Translation for the current selection, looked up without being asked. */
  const [glance, setGlance] = React.useState<{
    term: string;
    translation: string | null;
    phonetic: string | null;
    lemma?: string;
    state: "loading" | "done";
  } | null>(null);
  const [savedWord, setSavedWord] = React.useState<string | null>(null);
  const rootRef = React.useRef<HTMLDivElement>(null);
  const { activeStudentId } = useApp();

  const paragraphs = React.useMemo(
    () => parseParagraphs(passage.text),
    [passage.text]
  );
  const mine = React.useMemo(
    () => highlights.filter((h) => h.passageId === passage.id),
    [highlights, passage.id]
  );
  const noted = mine.filter((h) => h.note);

  // Read the current selection and park it until the user picks an action.
  const captureSelection = React.useCallback(() => {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || sel.rangeCount === 0) {
      setPending(null);
      return;
    }
    const range = sel.getRangeAt(0);
    const startPara = (range.startContainer.parentElement as HTMLElement | null)
      ?.closest<HTMLElement>("[data-para]");
    const endPara = (range.endContainer.parentElement as HTMLElement | null)
      ?.closest<HTMLElement>("[data-para]");
    // Cross-paragraph selections have no single offset frame — ignore them.
    if (!startPara || startPara !== endPara) {
      setPending(null);
      return;
    }
    const start = offsetIn(startPara, range.startContainer, range.startOffset);
    const end = offsetIn(startPara, range.endContainer, range.endOffset);
    if (start === null || end === null || start === end) {
      setPending(null);
      return;
    }
    const rect = range.getBoundingClientRect();
    const rootRect = rootRef.current?.getBoundingClientRect();
    setPending({
      para: Number(startPara.dataset.para),
      start: Math.min(start, end),
      end: Math.max(start, end),
      quote: sel.toString().trim(),
      x: rect.left + rect.width / 2 - (rootRect?.left ?? 0),
      y: rect.top - (rootRect?.top ?? 0),
    });
  }, []);

  // Look the selection up as soon as it exists. The translation is the reason
  // a student selects a word at all, so making them click for it first was
  // pure friction.
  React.useEffect(() => {
    const quote = pending?.quote?.trim();
    if (!quote) {
      setGlance(null);
      return;
    }
    // A sentence-long selection is a highlight, not a word to translate.
    if (quote.length > 40 || quote.split(/\s+/).length > 4) {
      setGlance(null);
      return;
    }
    let cancelled = false;
    setGlance({ term: quote, translation: null, phonetic: null, state: "loading" });
    (async () => {
      try {
        const res = await fetch("/api/vocabulary/translate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: quote }),
        });
        const body = (await res.json()) as {
          translation: string | null;
          phonetic: string | null;
          lemma?: string;
        };
        if (cancelled) return;
        setGlance({
          term: quote,
          translation: body.translation ?? null,
          phonetic: body.phonetic ?? null,
          lemma: body.lemma,
          state: "done",
        });
      } catch {
        if (!cancelled) {
          setGlance({ term: quote, translation: null, phonetic: null, state: "done" });
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [pending?.quote]);

  /** Persist a word to the student's list. */
  const saveToVocabulary = React.useCallback(
    async (input: {
      term: string;
      translation: string;
      phonetic: string | null;
      example: string;
    }) => {
      try {
        const res = await fetch("/api/vocabulary", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ studentId: activeStudentId, ...input }),
        });
        const body = (await res.json()) as { error?: string; existed?: boolean };
        return res.ok
          ? { ok: true, existed: body.existed }
          : { ok: false, error: body.error };
      } catch {
        return { ok: false, error: "Нет соединения с сервером" };
      }
    },
    [activeStudentId]
  );

  /**
   * One-click save, used when the lookup already knows the translation. Only
   * an unknown word still needs the popover, to be typed in by hand.
   */
  async function saveKnownWord() {
    if (!pending || !glance?.translation) return;
    const body = paragraphs[pending.para]?.body ?? "";
    const term = pending.quote;
    const res = await saveToVocabulary({
      term,
      translation: glance.translation,
      phonetic: glance.phonetic,
      example: sentenceAround(body, term),
    });
    window.getSelection()?.removeAllRanges();
    setPending(null);
    if (res.ok) {
      setSavedWord(res.existed ? `${term} — уже в словаре` : `${term} → в словарь`);
      setTimeout(() => setSavedWord(null), 2200);
    }
  }

  /** Hand the selection to the vocabulary popover with its sentence. */
  function openVocabulary() {
    if (!pending) return;
    const body = paragraphs[pending.para]?.body ?? "";
    setVocabTarget({
      term: pending.quote,
      context: sentenceAround(body, pending.quote),
      x: pending.x,
      y: pending.y,
    });
    window.getSelection()?.removeAllRanges();
    setPending(null);
  }

  function commit(withNote: boolean) {
    if (!pending) return;
    addHighlight({
      passageId: passage.id,
      para: pending.para,
      start: pending.start,
      end: pending.end,
      quote: pending.quote,
    });
    window.getSelection()?.removeAllRanges();
    setPending(null);
    if (withNote) setShowNotes(true);
  }

  return (
    <div ref={rootRef} className="relative flex h-full flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-2 border-b px-4 py-2.5">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Passage {passage.number}
          </p>
          <h2 className="truncate font-display text-base font-semibold">
            {passage.title}
          </h2>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <div className="flex items-center rounded-md border">
            <button
              type="button"
              onClick={() => setFontIdx((i) => Math.max(0, i - 1))}
              disabled={fontIdx === 0}
              aria-label="Уменьшить шрифт"
              className="flex h-7 w-7 items-center justify-center rounded-l-md text-xs transition-colors hover:bg-secondary disabled:opacity-40"
            >
              A−
            </button>
            <Type className="h-3 w-3 text-muted-foreground" />
            <button
              type="button"
              onClick={() =>
                setFontIdx((i) => Math.min(FONT_STEPS.length - 1, i + 1))
              }
              disabled={fontIdx === FONT_STEPS.length - 1}
              aria-label="Увеличить шрифт"
              className="flex h-7 w-7 items-center justify-center rounded-r-md text-sm transition-colors hover:bg-secondary disabled:opacity-40"
            >
              A+
            </button>
          </div>
          <Button
            variant={showNotes ? "default" : "outline"}
            size="sm"
            className="h-7"
            onClick={() => setShowNotes((s) => !s)}
            aria-pressed={showNotes}
          >
            <StickyNote className="h-3.5 w-3.5" />
            Заметки
            {noted.length > 0 && (
              <span className="tabular ml-0.5 rounded-full bg-background/25 px-1.5 text-[10px]">
                {noted.length}
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* Body */}
      <div
        ref={scrollRef}
        className="slim-scroll min-h-0 flex-1 overflow-y-auto px-5 py-4"
      >
        {passage.subtitle && (
          <p className="mb-4 text-sm italic text-muted-foreground">
            {passage.subtitle}
          </p>
        )}
        <div
          className={cn("space-y-4 text-foreground/90", FONT_STEPS[fontIdx].cls)}
          onMouseUp={captureSelection}
          onKeyUp={(e) => e.shiftKey && captureSelection()}
        >
          {paragraphs.map((para, i) => (
            <div key={i} className="flex gap-3">
              {para.label && (
                <span
                  aria-hidden
                  className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-secondary text-xs font-bold text-muted-foreground"
                >
                  {para.label}
                </span>
              )}
              {/*
                Anything inside `[data-para]` counts towards highlight offsets,
                so the screen-reader label lives outside it.
              */}
              {para.label && (
                <span className="sr-only">Paragraph {para.label}. </span>
              )}
              <p data-para={i} className="min-w-0 flex-1">
                {segment(
                  para.body,
                  mine.filter((h) => h.para === i)
                ).map((run, j) =>
                  run.hl ? (
                    <mark
                      key={j}
                      onClick={() =>
                        setEditingNote(
                          editingNote === run.hl!.id ? null : run.hl!.id
                        )
                      }
                      className={cn(
                        "cursor-pointer rounded px-0.5 transition-colors",
                        run.hl.note
                          ? "bg-primary/25 underline decoration-primary decoration-dotted underline-offset-4"
                          : "bg-warning/30"
                      )}
                      title={run.hl.note ?? "Нажмите, чтобы добавить заметку"}
                    >
                      {run.text}
                    </mark>
                  ) : (
                    <React.Fragment key={j}>{run.text}</React.Fragment>
                  )
                )}
              </p>
            </div>
          ))}
        </div>
        <p className="mt-6 border-t pt-3 text-xs text-muted-foreground/70">
          Выделите фрагмент текста, чтобы подсветить его или добавить заметку.
        </p>
      </div>

      {/* Floating selection toolbar */}
      {pending && (
        <div
          className="absolute z-20 -translate-x-1/2 -translate-y-full pb-2"
          style={{ left: pending.x, top: pending.y }}
        >
          <div className="overflow-hidden rounded-lg border bg-popover shadow-lg">
            {/* The translation appears here on its own — selecting the word is
                the whole request, so nothing should have to be clicked first. */}
            {glance && (
              <div className="flex items-start gap-2 border-b px-2.5 py-1.5">
                <Languages className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                <div className="min-w-0 max-w-[16rem]">
                  {glance.state === "loading" ? (
                    <p className="text-xs text-muted-foreground">Ищем перевод…</p>
                  ) : glance.translation ? (
                    <>
                      <p className="text-sm font-medium leading-tight">
                        {glance.translation}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {glance.lemma && glance.lemma !== glance.term.toLowerCase()
                          ? `${glance.lemma}${glance.phonetic ? " " + glance.phonetic : ""}`
                          : glance.phonetic}
                      </p>
                    </>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      Перевода нет — введите свой
                    </p>
                  )}
                </div>
              </div>
            )}
            <div className="flex items-center gap-1 p-1">
              <Button size="sm" className="h-7" onClick={() => commit(false)}>
                <Highlighter className="h-3.5 w-3.5" /> Выделить
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-7"
                onClick={() => commit(true)}
              >
                <StickyNote className="h-3.5 w-3.5" /> С заметкой
              </Button>
              {/* Known word: one click saves it. Unknown: the popover opens so
                  the translation can be typed rather than guessed. */}
              <Button
                size="sm"
                variant="outline"
                className="h-7"
                onClick={() =>
                  glance?.translation ? void saveKnownWord() : openVocabulary()
                }
              >
                <BookmarkPlus className="h-3.5 w-3.5" />
                {glance?.translation ? "В словарь" : "В словарь…"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation for a one-click save */}
      {savedWord && (
        <div
          role="status"
          className="animate-fade-up absolute bottom-4 left-1/2 z-30 flex -translate-x-1/2 items-center gap-2 rounded-lg border border-success/30 bg-success/10 px-3 py-2 text-sm text-success shadow-lg"
        >
          <BookmarkPlus className="h-4 w-4 shrink-0" /> {savedWord}
        </div>
      )}

      {/* Quick translate + save to the student's vocabulary */}
      {vocabTarget && (
        <SaveWordPopover
          target={vocabTarget}
          onClose={() => setVocabTarget(null)}
          onSave={saveToVocabulary}
        />
      )}

      {/* Note editor for a clicked highlight */}
      {editingNote && (
        <NoteEditor
          highlight={mine.find((h) => h.id === editingNote)}
          onSave={(note) => {
            setNote(editingNote, note);
            setEditingNote(null);
            if (note) setShowNotes(true);
          }}
          onDelete={() => {
            removeHighlight(editingNote);
            setEditingNote(null);
          }}
          onCancel={() => setEditingNote(null)}
        />
      )}

      {/* Notes panel */}
      {showNotes && (
        <div className="max-h-56 shrink-0 overflow-y-auto border-t bg-secondary/30 px-4 py-3">
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Заметки к тексту {passage.number}
          </p>
          {mine.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Пока ничего не выделено. Выделите фрагмент в тексте, чтобы начать.
            </p>
          ) : (
            <ul className="space-y-2">
              {mine.map((h) => (
                <li
                  key={h.id}
                  className="rounded-md border bg-card p-2.5 text-sm"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="line-clamp-2 flex-1 italic text-muted-foreground">
                      «{h.quote}»
                    </p>
                    <button
                      type="button"
                      onClick={() => removeHighlight(h.id)}
                      aria-label="Удалить выделение"
                      className="shrink-0 text-muted-foreground/60 transition-colors hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  {h.note ? (
                    <p className="mt-1.5">{h.note}</p>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setEditingNote(h.id)}
                      className="mt-1 text-xs font-medium text-primary hover:underline"
                    >
                      Добавить заметку
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

function NoteEditor({
  highlight,
  onSave,
  onDelete,
  onCancel,
}: {
  highlight?: Highlight;
  onSave: (note: string) => void;
  onDelete: () => void;
  onCancel: () => void;
}) {
  const [draft, setDraft] = React.useState(highlight?.note ?? "");
  if (!highlight) return null;

  return (
    <div className="absolute inset-x-4 bottom-4 z-30 rounded-lg border bg-popover p-3 shadow-xl">
      <p className="mb-2 line-clamp-1 text-xs italic text-muted-foreground">
        «{highlight.quote}»
      </p>
      <Textarea
        autoFocus
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder="Ваша заметка к этому фрагменту…"
        className="min-h-[72px] text-sm"
        onKeyDown={(e) => {
          if (e.key === "Escape") onCancel();
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) onSave(draft);
        }}
      />
      <div className="mt-2 flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={onDelete}>
          <Trash2 className="h-3.5 w-3.5" /> Удалить
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onCancel}>
            Отмена
          </Button>
          <Button size="sm" onClick={() => onSave(draft)}>
            Сохранить
          </Button>
        </div>
      </div>
    </div>
  );
}
