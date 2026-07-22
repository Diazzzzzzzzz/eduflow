"use client";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { EngineQuestion } from "@/lib/cambridge-types";

export function QuestionView({
  q,
  value,
  onChange,
  disabled,
}: {
  q: EngineQuestion;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  const number = (
    <span className="tabular font-semibold text-foreground">
      {q.questionNumber}.
    </span>
  );

  if (q.type === "fill_blanks") {
    return (
      <div className="space-y-2">
        <p className="text-sm leading-relaxed">
          {number} {q.prompt}
        </p>
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder="Ваш ответ"
          className="max-w-xs"
          aria-label={`Ответ на вопрос ${q.questionNumber}`}
        />
      </div>
    );
  }

  const options = q.options ?? [];
  const stacked = q.type === "mcq";
  return (
    <div className="space-y-2">
      <p className="text-sm leading-relaxed">
        {number} {q.prompt}
      </p>
      <div className={cn("flex gap-2", stacked ? "flex-col" : "flex-wrap")}>
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            disabled={disabled}
            onClick={() => onChange(opt)}
            className={cn(
              "rounded-md border px-3 py-1.5 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              value === opt
                ? "border-primary bg-primary/10 font-medium text-primary"
                : "bg-card hover:bg-secondary",
              disabled && "cursor-default opacity-70"
            )}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}
