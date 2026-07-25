"use client";

import * as React from "react";
import { Flag } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { countWords } from "@/lib/exam/scoring";
import type {
  AnswerValue,
  ChoiceOption,
  ExamQuestion,
  QuestionGroup,
} from "@/lib/exam/types";
import { useExamSession } from "./exam-session";

// ---------------------------------------------------------------------------
// Shared shell
// ---------------------------------------------------------------------------

function QuestionShell({
  question,
  children,
  inline,
}: {
  question: ExamQuestion;
  children: React.ReactNode;
  /** Inline layout keeps the number beside a single-line control. */
  inline?: boolean;
}) {
  const { flagged, toggleFlag, answers } = useExamSession();
  const isFlagged = flagged.has(question.id);
  const answered = answers[question.id] !== undefined;
  const label = question.numberTo
    ? `${question.number}–${question.numberTo}`
    : String(question.number);

  return (
    <div
      id={`question-${question.id}`}
      className="scroll-mt-24 rounded-lg border bg-card p-3 transition-colors hover:border-primary/40"
    >
      <div className={cn("flex gap-3", inline ? "items-center" : "items-start")}>
        <span
          className={cn(
            "tabular mt-0.5 flex h-6 min-w-6 shrink-0 items-center justify-center rounded-md px-1 text-xs font-semibold ring-1 ring-inset",
            answered
              ? "bg-primary/10 text-primary ring-primary/30"
              : "bg-secondary text-muted-foreground ring-border"
          )}
        >
          {label}
        </span>
        <div className="min-w-0 flex-1">{children}</div>
        <button
          type="button"
          onClick={() => toggleFlag(question.id)}
          aria-pressed={isFlagged}
          aria-label={
            isFlagged
              ? `Снять отметку с вопроса ${label}`
              : `Отметить вопрос ${label} для проверки`
          }
          className={cn(
            "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            isFlagged
              ? "bg-warning/15 text-warning"
              : "text-muted-foreground/40 hover:bg-secondary hover:text-muted-foreground"
          )}
        >
          <Flag className={cn("h-3.5 w-3.5", isFlagged && "fill-current")} />
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Choice controls
// ---------------------------------------------------------------------------

function LetterChoices({
  options,
  value,
  onChange,
  compact,
}: {
  options: ChoiceOption[];
  value: string;
  onChange: (v: string) => void;
  compact?: boolean;
}) {
  return (
    <div className={cn("flex gap-1.5", compact ? "flex-wrap" : "flex-col")}>
      {options.map((opt) => {
        const selected = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(selected ? "" : opt.value)}
            className={cn(
              "rounded-md border px-2.5 py-1.5 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              selected
                ? "border-primary bg-primary/10 font-medium text-primary"
                : "bg-card hover:bg-secondary"
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

function OptionSelect({
  options,
  value,
  onChange,
  placeholder,
  ariaLabel,
}: {
  options: ChoiceOption[];
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  ariaLabel: string;
}) {
  return (
    <Select value={value || undefined} onValueChange={onChange}>
      <SelectTrigger className="w-full max-w-sm" aria-label={ariaLabel}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function MultiChoices({
  options,
  value,
  onChange,
  selectCount,
}: {
  options: ChoiceOption[];
  value: string[];
  onChange: (v: string[]) => void;
  selectCount: number;
}) {
  const atLimit = value.length >= selectCount;
  return (
    <div className="flex flex-col gap-1.5">
      {options.map((opt) => {
        const selected = value.includes(opt.value);
        // Block a further pick at the limit so the answer stays markable.
        const blocked = !selected && atLimit;
        return (
          <button
            key={opt.value}
            type="button"
            role="checkbox"
            aria-checked={selected}
            disabled={blocked}
            onClick={() =>
              onChange(
                selected
                  ? value.filter((v) => v !== opt.value)
                  : [...value, opt.value]
              )
            }
            className={cn(
              "flex items-center gap-2 rounded-md border px-2.5 py-1.5 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              selected
                ? "border-primary bg-primary/10 font-medium text-primary"
                : blocked
                  ? "cursor-not-allowed opacity-45"
                  : "bg-card hover:bg-secondary"
            )}
          >
            <span
              className={cn(
                "flex h-4 w-4 shrink-0 items-center justify-center rounded border",
                selected ? "border-primary bg-primary" : "border-input"
              )}
            >
              {selected && (
                <svg viewBox="0 0 12 12" className="h-3 w-3 text-white">
                  <path
                    d="M2.5 6.5 5 9l4.5-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </span>
            {opt.label}
          </button>
        );
      })}
      <p className="text-xs text-muted-foreground">
        Выбрано {value.length} из {selectCount}
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Gap fill
// ---------------------------------------------------------------------------

function GapFill({
  question,
  value,
  onChange,
  wordLimit,
}: {
  question: ExamQuestion;
  value: string;
  onChange: (v: string) => void;
  wordLimit?: number;
}) {
  const limit = question.wordLimit ?? wordLimit;
  const over = !!limit && countWords(value) > limit;
  const parts = question.prompt.split("___");
  const hasGap = parts.length > 1;

  const field = (
    <span className="inline-flex flex-col align-middle">
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Ответ"
        aria-label={`Ответ на вопрос ${question.number}`}
        aria-invalid={over}
        className={cn(
          "h-8 w-40 px-2 text-sm",
          over && "border-warning focus-visible:ring-warning"
        )}
      />
    </span>
  );

  return (
    <div className="space-y-1.5">
      <p className="text-sm leading-7">
        {hasGap ? (
          parts.map((part, i) => (
            <React.Fragment key={i}>
              {part}
              {i < parts.length - 1 && field}
            </React.Fragment>
          ))
        ) : (
          <>
            {question.prompt} {field}
          </>
        )}
      </p>
      {over && (
        <p className="text-xs font-medium text-warning">
          Превышен лимит: не более {limit}{" "}
          {limit === 1 ? "слова" : "слов"} — ответ не будет засчитан.
        </p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Dispatcher
// ---------------------------------------------------------------------------

const SELECT_TYPES = new Set(["matching_headings", "sentence_endings"]);

export function QuestionRenderer({
  group,
  question,
}: {
  group: QuestionGroup;
  question: ExamQuestion;
}) {
  const { answers, setAnswer } = useExamSession();
  const raw: AnswerValue = answers[question.id] ?? "";
  const text = typeof raw === "string" ? raw : "";
  const list = Array.isArray(raw) ? raw : [];
  const options = question.options ?? group.options ?? [];
  const set = (v: AnswerValue) => setAnswer(question.id, v);

  switch (group.type) {
    case "gap_fill":
    case "short_answer":
      return (
        <QuestionShell question={question}>
          <GapFill
            question={question}
            value={text}
            onChange={set}
            wordLimit={group.wordLimit}
          />
        </QuestionShell>
      );

    case "true_false_not_given":
    case "yes_no_not_given":
      return (
        <QuestionShell question={question}>
          <div className="space-y-2">
            <p className="text-sm leading-relaxed">{question.prompt}</p>
            <LetterChoices
              options={options}
              value={text}
              onChange={set}
              compact
            />
          </div>
        </QuestionShell>
      );

    case "mcq_single":
      return (
        <QuestionShell question={question}>
          <div className="space-y-2">
            <p className="text-sm font-medium leading-relaxed">
              {question.prompt}
            </p>
            <LetterChoices options={options} value={text} onChange={set} />
          </div>
        </QuestionShell>
      );

    case "mcq_multi":
      return (
        <QuestionShell question={question}>
          <div className="space-y-2">
            <p className="text-sm font-medium leading-relaxed">
              {question.prompt}
            </p>
            <MultiChoices
              options={options}
              value={list}
              onChange={set}
              selectCount={question.selectCount ?? 2}
            />
          </div>
        </QuestionShell>
      );

    case "matching":
    case "labelling":
    case "matching_headings":
    case "sentence_endings":
    default: {
      // Long option lists read better in a dropdown; short letter lists as chips.
      const useSelect = SELECT_TYPES.has(group.type) || options.length > 6;
      return (
        <QuestionShell question={question} inline={!useSelect}>
          <div
            className={cn(
              "gap-2",
              useSelect ? "space-y-2" : "flex flex-wrap items-center"
            )}
          >
            <p className="text-sm leading-relaxed">{question.prompt}</p>
            {useSelect ? (
              <OptionSelect
                options={options}
                value={text}
                onChange={set}
                placeholder="Выберите вариант"
                ariaLabel={`Ответ на вопрос ${question.number}`}
              />
            ) : (
              <LetterChoices
                options={options}
                value={text}
                onChange={set}
                compact
              />
            )}
          </div>
        </QuestionShell>
      );
    }
  }
}
