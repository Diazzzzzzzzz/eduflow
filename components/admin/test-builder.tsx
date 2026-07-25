"use client";

import * as React from "react";
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Check,
  ClipboardPaste,
  Code2,
  Copy,
  Download,
  Loader2,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  draftToSection,
  parsePastedAnswers,
  parsePastedQuestions,
  QUESTION_TYPE_LABELS,
  validateDraft,
  type DraftPaper,
  type DraftQuestion,
  type DraftQuestionType,
} from "@/lib/exam/draft";

const STORAGE_KEY = "eduflow:test-builder-draft";

let keyCounter = 0;

/**
 * Keys must be stable between the server render and hydration, so the first
 * question uses a fixed key and only later ones get a generated suffix.
 * A random or time-based key here mismatches `htmlFor`/`id` pairs on hydration.
 */
function newQuestion(type: DraftQuestionType = "true_false_not_given"): DraftQuestion {
  keyCounter += 1;
  return {
    key: `q-${keyCounter}`,
    type,
    prompt: "",
    answer: "",
    optionsText: "",
    explanation: "",
  };
}

const EMPTY: DraftPaper = {
  id: "",
  title: "",
  passageTitle: "",
  passageSubtitle: "",
  passageText: "",
  durationMinutes: 20,
  attribution: "",
  wordLimit: 1,
  questions: [newQuestion()],
};

export function TestBuilder() {
  const [draft, setDraft] = React.useState<DraftPaper>(EMPTY);
  const [showJson, setShowJson] = React.useState(false);
  const [rightsConfirmed, setRightsConfirmed] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [saved, setSaved] = React.useState<string | null>(null);
  const [saveError, setSaveError] = React.useState<string | null>(null);
  const [copied, setCopied] = React.useState(false);
  const [pasteOpen, setPasteOpen] = React.useState(false);

  // Restore an unfinished draft so a long paste is never lost to a refresh.
  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setDraft(JSON.parse(raw) as DraftPaper);
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  React.useEffect(() => {
    const id = window.setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
      } catch {
        // Quota exceeded — editing continues in memory.
      }
    }, 500);
    return () => window.clearTimeout(id);
  }, [draft]);

  const set = <K extends keyof DraftPaper>(key: K, value: DraftPaper[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));

  const setQuestion = (index: number, patch: Partial<DraftQuestion>) =>
    setDraft((d) => ({
      ...d,
      questions: d.questions.map((q, i) => (i === index ? { ...q, ...patch } : q)),
    }));

  const addQuestion = () =>
    setDraft((d) => ({
      ...d,
      questions: [
        ...d.questions,
        newQuestion(d.questions[d.questions.length - 1]?.type),
      ],
    }));

  const removeQuestion = (index: number) =>
    setDraft((d) => ({
      ...d,
      questions: d.questions.filter((_, i) => i !== index),
    }));

  const moveQuestion = (index: number, delta: number) =>
    setDraft((d) => {
      const next = [...d.questions];
      const target = index + delta;
      if (target < 0 || target >= next.length) return d;
      [next[index], next[target]] = [next[target], next[index]];
      return { ...d, questions: next };
    });

  const issues = React.useMemo(() => validateDraft(draft), [draft]);
  const json = React.useMemo(() => {
    try {
      return JSON.stringify(draftToSection(draft), null, 2);
    } catch {
      return "{}";
    }
  }, [draft]);

  const passageWords = draft.passageText.trim()
    ? draft.passageText.trim().split(/\s+/).length
    : 0;
  const blocking = issues.filter((i) => i.number === null);
  const canExport = draft.questions.length > 0 && blocking.length === 0;

  function download() {
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${draftToSection(draft).id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function copyJson() {
    await navigator.clipboard.writeText(json);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  async function save() {
    setSaving(true);
    setSaveError(null);
    setSaved(null);
    try {
      const res = await fetch("/api/exam/drafts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ draft, rightsConfirmed }),
      });
      const data = (await res.json()) as {
        path?: string;
        error?: string;
        issues?: { number: number | null; message: string }[];
      };
      if (!res.ok) {
        setSaveError(
          data.error ??
            data.issues?.map((i) => i.message).join(" ") ??
            "Не удалось сохранить."
        );
      } else {
        setSaved(data.path ?? "сохранено");
      }
    } catch {
      setSaveError("Сеть недоступна. JSON можно скачать кнопкой рядом.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">
            Добавление теста
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Вставьте текст пассажа, заполните вопросы и выгрузите готовый файл
            теста. Черновик сохраняется автоматически.
          </p>
        </div>
        <Badge variant="secondary">Reading · Passage 1</Badge>
      </div>

      {/* Paper details */}
      <Card>
        <CardHeader>
          <CardTitle className="font-display text-base">О тесте</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="title">Название теста</Label>
            <Input
              id="title"
              value={draft.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="Academic Reading — Practice Test 3"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="pid">
              Идентификатор{" "}
              <span className="font-normal text-muted-foreground">
                (необязательно)
              </span>
            </Label>
            <Input
              id="pid"
              value={draft.id}
              onChange={(e) => set("id", e.target.value)}
              placeholder="создастся из названия"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="ptitle">Заголовок пассажа</Label>
            <Input
              id="ptitle"
              value={draft.passageTitle}
              onChange={(e) => set("passageTitle", e.target.value)}
              placeholder="Например: How coastal cities hold back the sea"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="psub">
              Подзаголовок{" "}
              <span className="font-normal text-muted-foreground">
                (необязательно)
              </span>
            </Label>
            <Input
              id="psub"
              value={draft.passageSubtitle}
              onChange={(e) => set("passageSubtitle", e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="dur">Время на секцию, мин</Label>
            <Input
              id="dur"
              type="number"
              min={5}
              max={120}
              value={draft.durationMinutes}
              onChange={(e) =>
                set("durationMinutes", Number(e.target.value) || 20)
              }
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="attr">Источник материала</Label>
            <Input
              id="attr"
              value={draft.attribution}
              onChange={(e) => set("attribution", e.target.value)}
              placeholder="Например: собственный материал центра"
            />
          </div>
        </CardContent>
      </Card>

      {/* Passage */}
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="font-display text-base">
              Текст пассажа
            </CardTitle>
            <CardDescription>
              Абзацы разделяйте пустой строкой. Чтобы абзацы получили буквы для
              matching headings, начните их с <code>[A]</code>, <code>[B]</code>{" "}
              и так далее.
            </CardDescription>
          </div>
          <span
            className={cn(
              "tabular shrink-0 rounded-full border px-2.5 py-1 text-xs",
              passageWords >= 700
                ? "border-success/30 bg-success/10 text-success"
                : "text-muted-foreground"
            )}
          >
            {passageWords} слов
          </span>
        </CardHeader>
        <CardContent>
          <Textarea
            value={draft.passageText}
            onChange={(e) => set("passageText", e.target.value)}
            placeholder="Вставьте сюда полный текст пассажа…"
            className="min-h-[280px] font-[15px] leading-7"
            aria-label="Текст пассажа"
          />
        </CardContent>
      </Card>

      {/* Questions */}
      <Card>
        <CardHeader className="flex-row flex-wrap items-center justify-between gap-3 space-y-0">
          <div>
            <CardTitle className="font-display text-base">
              Вопросы
              <span className="tabular ml-2 text-sm font-normal text-muted-foreground">
                {draft.questions.length}
              </span>
            </CardTitle>
            <CardDescription>
              Номера проставляются автоматически по порядку.
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPasteOpen((v) => !v)}
          >
            <ClipboardPaste /> Массовая вставка
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {pasteOpen && (
            <BulkPaste
              onApply={(prompts, answers, type) =>
                setDraft((d) => ({
                  ...d,
                  questions: [
                    ...d.questions.filter((q) => q.prompt.trim() || q.answer.trim()),
                    ...prompts.map((prompt, i) => ({
                      ...newQuestion(type),
                      prompt,
                      answer: answers[i] ?? "",
                    })),
                  ],
                }))
              }
            />
          )}

          {draft.questions.map((q, i) => {
            const qIssues = issues.filter((issue) => issue.number === i + 1);
            return (
              <div
                key={q.key}
                className={cn(
                  "rounded-lg border p-4",
                  qIssues.length ? "border-warning/40 bg-warning/5" : "bg-card"
                )}
              >
                <div className="mb-3 flex items-center justify-between gap-2">
                  <span className="tabular flex h-6 min-w-6 items-center justify-center rounded-md bg-primary/10 px-1.5 text-xs font-semibold text-primary">
                    {i + 1}
                  </span>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      aria-label={`Переместить вопрос ${i + 1} вверх`}
                      disabled={i === 0}
                      onClick={() => moveQuestion(i, -1)}
                    >
                      <ArrowUp className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      aria-label={`Переместить вопрос ${i + 1} вниз`}
                      disabled={i === draft.questions.length - 1}
                      onClick={() => moveQuestion(i, 1)}
                    >
                      <ArrowDown className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                      aria-label={`Удалить вопрос ${i + 1}`}
                      onClick={() => removeQuestion(i)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_200px]">
                  <div className="grid gap-2">
                    <Label htmlFor={`prompt-${q.key}`}>Текст вопроса</Label>
                    <Textarea
                      id={`prompt-${q.key}`}
                      value={q.prompt}
                      onChange={(e) => setQuestion(i, { prompt: e.target.value })}
                      placeholder={
                        q.type === "gap_fill"
                          ? "Предложение с пропуском, отмеченным ___"
                          : "Утверждение или вопрос"
                      }
                      className="min-h-[64px]"
                    />
                  </div>
                  <div className="grid content-start gap-3">
                    <div className="grid gap-2">
                      <Label htmlFor={`type-${q.key}`}>Тип</Label>
                      <Select
                        value={q.type}
                        onValueChange={(v) =>
                          setQuestion(i, { type: v as DraftQuestionType, answer: "" })
                        }
                      >
                        <SelectTrigger id={`type-${q.key}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(QUESTION_TYPE_LABELS).map(([v, label]) => (
                            <SelectItem key={v} value={v}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <AnswerField
                      question={q}
                      onChange={(answer) => setQuestion(i, { answer })}
                    />
                  </div>
                </div>

                {q.type === "mcq_single" && (
                  <div className="mt-3 grid gap-2">
                    <Label htmlFor={`opts-${q.key}`}>
                      Варианты — по одному на строку
                    </Label>
                    <Textarea
                      id={`opts-${q.key}`}
                      value={q.optionsText}
                      onChange={(e) =>
                        setQuestion(i, { optionsText: e.target.value })
                      }
                      placeholder={"A. Первый вариант\nB. Второй вариант"}
                      className="min-h-[80px]"
                    />
                  </div>
                )}

                <div className="mt-3 grid gap-2">
                  <Label htmlFor={`exp-${q.key}`}>
                    Пояснение{" "}
                    <span className="font-normal text-muted-foreground">
                      (показывается после сдачи)
                    </span>
                  </Label>
                  <Input
                    id={`exp-${q.key}`}
                    value={q.explanation}
                    onChange={(e) =>
                      setQuestion(i, { explanation: e.target.value })
                    }
                    placeholder="Например: см. третий абзац"
                  />
                </div>

                {qIssues.length > 0 && (
                  <ul className="mt-3 space-y-1">
                    {qIssues.map((issue, k) => (
                      <li
                        key={k}
                        className="flex items-start gap-1.5 text-xs text-warning"
                      >
                        <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" />
                        {issue.message}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}

          <div className="flex flex-wrap items-center gap-3">
            <Button variant="outline" onClick={addQuestion}>
              <Plus /> Добавить ещё вопрос
            </Button>
            <div className="flex items-center gap-2">
              <Label htmlFor="wl" className="text-sm text-muted-foreground">
                Лимит слов для ввода
              </Label>
              <Input
                id="wl"
                type="number"
                min={1}
                max={4}
                value={draft.wordLimit}
                onChange={(e) => set("wordLimit", Number(e.target.value) || 1)}
                className="w-16"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Issues + output */}
      {blocking.length > 0 && (
        <div className="rounded-lg border border-warning/40 bg-warning/5 p-4">
          <p className="flex items-center gap-2 text-sm font-medium text-warning">
            <AlertTriangle className="h-4 w-4" /> Нужно заполнить
          </p>
          <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
            {blocking.map((issue, i) => (
              <li key={i}>— {issue.message}</li>
            ))}
          </ul>
        </div>
      )}

      <Card>
        <CardContent className="space-y-4 p-5">
          <label className="flex items-start gap-2.5 text-sm">
            <input
              type="checkbox"
              checked={rightsConfirmed}
              onChange={(e) => setRightsConfirmed(e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 rounded border-input"
            />
            <span className="text-muted-foreground">
              Подтверждаю, что у центра есть права на публикацию этого материала:
              он создан нами либо используется по лицензии правообладателя.
            </span>
          </label>

          <div className="flex flex-wrap items-center gap-2">
            <Button onClick={save} disabled={!canExport || !rightsConfirmed || saving}>
              {saving ? (
                <>
                  <Loader2 className="animate-spin" /> Сохранение…
                </>
              ) : (
                <>
                  <Save /> Сохранить в базу
                </>
              )}
            </Button>
            <Button variant="outline" onClick={download} disabled={!canExport}>
              <Download /> Скачать JSON
            </Button>
            <Button variant="outline" onClick={copyJson} disabled={!canExport}>
              {copied ? <Check /> : <Copy />}
              {copied ? "Скопировано" : "Скопировать JSON"}
            </Button>
            <Button variant="ghost" onClick={() => setShowJson((v) => !v)}>
              <Code2 /> {showJson ? "Скрыть" : "Показать"} JSON
            </Button>
          </div>

          {saved && (
            <p className="flex items-center gap-2 rounded-md border border-success/30 bg-success/10 px-3 py-2 text-sm text-success">
              <Check className="h-4 w-4" /> Сохранено: {saved}
            </p>
          )}
          {saveError && (
            <p className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /> {saveError}
            </p>
          )}

          {showJson && (
            <pre className="slim-scroll max-h-96 overflow-auto rounded-lg border bg-secondary/40 p-3 text-xs leading-relaxed">
              {json}
            </pre>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/** Answer entry adapts to the question type so the value is always valid. */
function AnswerField({
  question,
  onChange,
}: {
  question: DraftQuestion;
  onChange: (value: string) => void;
}) {
  if (
    question.type === "true_false_not_given" ||
    question.type === "yes_no_not_given"
  ) {
    const values =
      question.type === "true_false_not_given"
        ? ["TRUE", "FALSE", "NOT GIVEN"]
        : ["YES", "NO", "NOT GIVEN"];
    return (
      <div className="grid gap-2">
        <Label htmlFor={`ans-${question.key}`}>Правильный ответ</Label>
        <Select value={question.answer || undefined} onValueChange={onChange}>
          <SelectTrigger id={`ans-${question.key}`}>
            <SelectValue placeholder="Выберите" />
          </SelectTrigger>
          <SelectContent>
            {values.map((v) => (
              <SelectItem key={v} value={v}>
                {v}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }

  return (
    <div className="grid gap-2">
      <Label htmlFor={`ans-${question.key}`}>Правильный ответ</Label>
      <Input
        id={`ans-${question.key}`}
        value={question.answer}
        onChange={(e) => onChange(e.target.value)}
        placeholder={question.type === "mcq_single" ? "B" : "слово"}
      />
      {question.type === "gap_fill" && (
        <p className="text-xs text-muted-foreground">
          Несколько допустимых вариантов — через <code>|</code>, например{" "}
          <code>gut|intestines</code>
        </p>
      )}
    </div>
  );
}

/** Paste a numbered list of questions and its answer key in one go. */
function BulkPaste({
  onApply,
}: {
  onApply: (
    prompts: string[],
    answers: string[],
    type: DraftQuestionType
  ) => void;
}) {
  const [questionsText, setQuestionsText] = React.useState("");
  const [answersText, setAnswersText] = React.useState("");
  const [type, setType] = React.useState<DraftQuestionType>(
    "true_false_not_given"
  );

  const prompts = parsePastedQuestions(questionsText);
  const answers = parsePastedAnswers(answersText);
  const mismatch =
    prompts.length > 0 && answers.length > 0 && prompts.length !== answers.length;

  return (
    <div className="space-y-3 rounded-lg border border-dashed bg-secondary/30 p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="bulk-q">Вопросы — по одному на строку</Label>
          <Textarea
            id="bulk-q"
            value={questionsText}
            onChange={(e) => setQuestionsText(e.target.value)}
            placeholder={"1. Первое утверждение\n2. Второе утверждение"}
            className="min-h-[130px]"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="bulk-a">Ответы — в том же порядке</Label>
          <Textarea
            id="bulk-a"
            value={answersText}
            onChange={(e) => setAnswersText(e.target.value)}
            placeholder={"1. TRUE\n2. NOT GIVEN"}
            className="min-h-[130px]"
          />
        </div>
      </div>
      <div className="flex flex-wrap items-end gap-3">
        <div className="grid gap-2">
          <Label htmlFor="bulk-type">Тип для всех</Label>
          <Select value={type} onValueChange={(v) => setType(v as DraftQuestionType)}>
            <SelectTrigger id="bulk-type" className="w-64">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(QUESTION_TYPE_LABELS).map(([v, label]) => (
                <SelectItem key={v} value={v}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button
          onClick={() => {
            onApply(prompts, answers, type);
            setQuestionsText("");
            setAnswersText("");
          }}
          disabled={prompts.length === 0}
        >
          <Plus /> Создать {prompts.length || ""} вопрос
          {prompts.length === 1 ? "" : "ов"}
        </Button>
        {mismatch && (
          <p className="flex items-center gap-1.5 text-xs text-warning">
            <AlertTriangle className="h-3.5 w-3.5" />
            Вопросов {prompts.length}, ответов {answers.length} — часть останется
            без ответа.
          </p>
        )}
      </div>
    </div>
  );
}
