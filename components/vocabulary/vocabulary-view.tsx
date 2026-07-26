"use client";

import * as React from "react";
import {
  AlertTriangle,
  BookOpen,
  GraduationCap,
  Layers,
  Loader2,
  Plus,
  RotateCw,
  Search,
  Trash2,
  Volume2,
} from "lucide-react";
import { useApp } from "@/components/app-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useSpeech, useVocabulary } from "@/lib/use-vocabulary";
import {
  SOURCE_LABELS,
  STATUS_LABELS,
  STATUS_ORDER,
  type VocabEntry,
  type VocabStatus,
} from "@/lib/vocabulary-data";
import { Flashcards } from "./flashcards";

type Filter = "all" | VocabStatus | "teacher" | "student";

const STATUS_VARIANT: Record<VocabStatus, "secondary" | "default" | "success"> = {
  new: "secondary",
  learning: "default",
  mastered: "success",
};

export function VocabularyView() {
  const { activeStudent } = useApp();
  const vocab = useVocabulary(activeStudent?.id);
  const [filter, setFilter] = React.useState<Filter>("all");
  const [query, setQuery] = React.useState("");
  const [drilling, setDrilling] = React.useState(false);
  const [adding, setAdding] = React.useState(false);
  const { speak, supported } = useSpeech();

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return vocab.entries.filter((e) => {
      const matchesFilter =
        filter === "all"
          ? true
          : filter === "teacher" || filter === "student"
            ? e.source === filter
            : e.status === filter;
      const matchesQuery =
        !q ||
        e.term.toLowerCase().includes(q) ||
        e.translation.toLowerCase().includes(q);
      return matchesFilter && matchesQuery;
    });
  }, [vocab.entries, filter, query]);

  const counts = React.useMemo(() => {
    const by = (s: VocabStatus) =>
      vocab.entries.filter((e) => e.status === s).length;
    return {
      total: vocab.entries.length,
      new: by("new"),
      learning: by("learning"),
      mastered: by("mastered"),
      teacher: vocab.entries.filter((e) => e.source === "teacher").length,
    };
  }, [vocab.entries]);

  if (vocab.status === "loading") return <VocabSkeleton />;

  if (vocab.status === "error") {
    return (
      <Card className="mx-auto max-w-md">
        <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <AlertTriangle className="h-5 w-5" />
          </span>
          <p className="font-medium">Не удалось загрузить словарь</p>
          <Button variant="outline" size="sm" onClick={vocab.reload}>
            <RotateCw /> Повторить
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (drilling) {
    return (
      <Flashcards
        entries={filtered}
        onStatusChange={(id, status) => void vocab.setStatus(id, status)}
        onExit={() => setDrilling(false)}
      />
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3 animate-fade-up">
        <div>
          <h2 className="font-display text-lg font-semibold">Мой словарь</h2>
          <p className="text-sm text-muted-foreground">
            Слова, сохранённые во время чтения, и списки от преподавателя.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setAdding(true)}>
            <Plus /> Добавить слово
          </Button>
          <Button
            size="sm"
            disabled={filtered.length === 0}
            onClick={() => setDrilling(true)}
          >
            <Layers /> Учить слова ({filtered.length})
          </Button>
        </div>
      </div>

      {vocab.demo && (
        <p className="flex items-start gap-2 rounded-lg border border-warning/30 bg-warning/5 px-3 py-2 text-sm text-warning">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          Показан демонстрационный набор: словарь этого студента ещё не сохранён
          в базе, поэтому изменения не сохранятся.
        </p>
      )}

      {/* Counters */}
      <div className="grid gap-3 sm:grid-cols-4">
        {(
          [
            ["Всего", counts.total, "all"],
            [STATUS_LABELS.new, counts.new, "new"],
            [STATUS_LABELS.learning, counts.learning, "learning"],
            [STATUS_LABELS.mastered, counts.mastered, "mastered"],
          ] as const
        ).map(([label, value, key]) => (
          <button
            key={key}
            type="button"
            onClick={() => setFilter(key as Filter)}
            className={cn(
              "rounded-lg border p-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              filter === key
                ? "border-primary bg-primary/5 ring-1 ring-inset ring-primary/20"
                : "bg-card hover:bg-secondary/50"
            )}
          >
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              {label}
            </p>
            <p className="tabular mt-1 font-display text-2xl font-bold">
              {value}
            </p>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск по слову или переводу…"
            className="w-64 pl-8"
            aria-label="Поиск по словарю"
          />
        </div>
        {(
          [
            ["all", "Все"],
            ["teacher", SOURCE_LABELS.teacher],
            ["student", SOURCE_LABELS.student],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setFilter(key)}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              filter === key
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-secondary"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed py-14 text-center">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-muted-foreground">
            <BookOpen className="h-5 w-5" />
          </span>
          <p className="font-medium">
            {vocab.entries.length === 0
              ? "Словарь пока пуст"
              : "Ничего не найдено"}
          </p>
          <p className="max-w-[44ch] text-sm text-muted-foreground">
            {vocab.entries.length === 0
              ? "Выделите слово в тексте теста и нажмите «В словарь» — оно попадёт сюда вместе с предложением-примером."
              : "Попробуйте другой фильтр или запрос."}
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {filtered.map((entry, i) => (
            <li key={entry.id}>
              <WordRow
                entry={entry}
                index={i}
                canSpeak={supported}
                onSpeak={() => speak(entry.term)}
                onStatus={(s) => void vocab.setStatus(entry.id, s)}
                onDelete={() => void vocab.removeWord(entry.id)}
              />
            </li>
          ))}
        </ul>
      )}

      <AddWordDialog
        open={adding}
        onClose={() => setAdding(false)}
        onSave={vocab.addWord}
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */

function WordRow({
  entry,
  index,
  canSpeak,
  onSpeak,
  onStatus,
  onDelete,
}: {
  entry: VocabEntry;
  index: number;
  canSpeak: boolean;
  onSpeak: () => void;
  onStatus: (status: VocabStatus) => void;
  onDelete: () => void;
}) {
  return (
    <div
      className="animate-fade-up rounded-lg border bg-card p-3.5 transition-all duration-200 hover:shadow-card-hover"
      style={{ animationDelay: `${Math.min(index, 10) * 30}ms` }}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-display font-semibold">{entry.term}</p>
            {entry.phonetic && (
              <span className="text-xs text-muted-foreground">
                {entry.phonetic}
              </span>
            )}
            {canSpeak && (
              <button
                type="button"
                onClick={onSpeak}
                aria-label={`Озвучить ${entry.term}`}
                className="flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Volume2 className="h-3.5 w-3.5" />
              </button>
            )}
            {entry.source === "teacher" && (
              <Badge variant="secondary" className="gap-1">
                <GraduationCap className="h-3 w-3" />
                {entry.topic ?? SOURCE_LABELS.teacher}
              </Badge>
            )}
          </div>
          <p className="mt-0.5 text-sm">{entry.translation}</p>
          {entry.example && (
            <p className="mt-1.5 line-clamp-2 text-xs italic leading-relaxed text-muted-foreground">
              «{entry.example}»
            </p>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-1">
          {/* Status is a segmented control: one click to move a word along. */}
          <div className="flex items-center rounded-md border p-0.5">
            {STATUS_ORDER.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => onStatus(s)}
                aria-pressed={entry.status === s}
                className={cn(
                  "rounded px-2 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  entry.status === s
                    ? s === "mastered"
                      ? "bg-success/15 text-success"
                      : s === "learning"
                        ? "bg-primary/10 text-primary"
                        : "bg-secondary text-foreground"
                    : "text-muted-foreground hover:bg-secondary"
                )}
              >
                {STATUS_LABELS[s]}
              </button>
            ))}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
            aria-label={`Удалить ${entry.term}`}
            onClick={onDelete}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */

function AddWordDialog({
  open,
  onClose,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (input: {
    term: string;
    translation: string;
    phonetic?: string | null;
    example?: string | null;
  }) => Promise<{ ok: boolean; error?: string }>;
}) {
  const [term, setTerm] = React.useState("");
  const [translation, setTranslation] = React.useState("");
  const [phonetic, setPhonetic] = React.useState("");
  const [example, setExample] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (open) {
      setTerm("");
      setTranslation("");
      setPhonetic("");
      setExample("");
      setError(null);
    }
  }, [open]);

  async function submit() {
    setSaving(true);
    setError(null);
    const res = await onSave({
      term,
      translation,
      phonetic: phonetic.trim() || null,
      example: example.trim() || null,
    });
    setSaving(false);
    if (!res.ok) {
      setError(res.error ?? "Не удалось сохранить");
      return;
    }
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Добавить слово</DialogTitle>
          <DialogDescription>
            Слово попадёт в ваш словарь и в тренажёр карточек.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3">
          <div className="grid gap-1.5">
            <Label htmlFor="vw-term">Слово или фраза</Label>
            <Input
              id="vw-term"
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="mitigate"
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="vw-translation">Перевод</Label>
            <Input
              id="vw-translation"
              value={translation}
              onChange={(e) => setTranslation(e.target.value)}
              placeholder="смягчать, уменьшать"
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="vw-phonetic">
              Транскрипция{" "}
              <span className="font-normal text-muted-foreground">
                (необязательно)
              </span>
            </Label>
            <Input
              id="vw-phonetic"
              value={phonetic}
              onChange={(e) => setPhonetic(e.target.value)}
              placeholder="/ˈmɪtɪɡeɪt/"
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="vw-example">
              Пример{" "}
              <span className="font-normal text-muted-foreground">
                (необязательно)
              </span>
            </Label>
            <Textarea
              id="vw-example"
              value={example}
              onChange={(e) => setExample(e.target.value)}
              placeholder="Предложение, в котором встретилось слово"
              className="min-h-[72px]"
            />
          </div>
        </div>

        {error && (
          <p className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /> {error}
          </p>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Отмена
          </Button>
          <Button
            disabled={!term.trim() || !translation.trim() || saving}
            onClick={() => void submit()}
          >
            {saving ? (
              <>
                <Loader2 className="animate-spin" /> Сохранение…
              </>
            ) : (
              <>
                <Plus /> Добавить
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function VocabSkeleton() {
  return (
    <div className="space-y-5" aria-busy aria-live="polite">
      <span className="sr-only">Загружаем словарь…</span>
      <div className="flex items-end justify-between gap-3">
        <div className="space-y-2">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-9 w-44" />
      </div>
      <div className="grid gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-[4.5rem] rounded-lg" />
        ))}
      </div>
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-lg" />
        ))}
      </div>
    </div>
  );
}
