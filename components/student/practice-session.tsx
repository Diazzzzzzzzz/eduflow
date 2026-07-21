"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Clock,
  Info,
  Mic,
  Pause,
  Play,
  Volume2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { SECTION_META } from "@/lib/practice-data";
import type { Skill } from "@/lib/types";

function DemoNote() {
  return (
    <div className="flex items-start gap-2 rounded-lg border border-primary/25 bg-primary/5 p-3 text-xs text-muted-foreground">
      <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
      Демонстрационный интерфейс. Реальные задания и проверка появятся позже —
      кнопки отключены.
    </div>
  );
}

/* ------------------------------ Listening ------------------------------ */
function ListeningSession() {
  const [playing, setPlaying] = React.useState(false);
  const [part, setPart] = React.useState(1);
  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="space-y-4 p-5">
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4].map((p) => (
              <button
                key={p}
                onClick={() => setPart(p)}
                className={cn(
                  "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                  part === p
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                )}
              >
                Section {p}
              </button>
            ))}
          </div>
          {/* Audio player placeholder */}
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
                  style={{ width: playing ? "42%" : "8%" }}
                />
              </div>
              <p className="tabular mt-1.5 text-xs text-muted-foreground">
                {playing ? "02:18" : "00:24"} / 05:30 · Section {part}
              </p>
            </div>
            <Volume2 className="h-4 w-4 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-3 p-5">
          <p className="text-sm font-medium">Вопросы {part * 10 - 9}–{part * 10}</p>
          {[1, 2, 3].map((q) => (
            <div key={q} className="space-y-1.5 rounded-lg border p-3">
              <p className="text-sm">
                {part * 10 - 10 + q}. Впишите пропущенное слово (не более трёх
                слов).
              </p>
              <div className="h-9 rounded-md border border-dashed bg-secondary/40" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

/* ------------------------------- Reading ------------------------------- */
function ReadingSession() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardContent className="space-y-3 p-5">
          <Badge variant="secondary">Текст 1</Badge>
          <h3 className="font-display font-semibold">
            The economics of urban green spaces
          </h3>
          <div className="space-y-2 text-sm leading-relaxed text-muted-foreground">
            <p>
              Демонстрационный отрывок. В реальном тесте здесь будет
              академический текст примерно на 800–900 слов с абзацами A–H.
            </p>
            <p>
              Городские парки долгое время воспринимались как статья расходов, а
              не инвестиция. Однако недавние исследования показывают, что
              зелёные зоны повышают стоимость недвижимости и снижают затраты на
              здравоохранение…
            </p>
            <p>
              Прокрутите текст и отвечайте на вопросы справа. Разделённый экран
              имитирует реальный интерфейс IELTS.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-3 p-5">
          <p className="text-sm font-medium">Questions 1–4 · True / False / Not Given</p>
          {[
            "Городские парки всегда считались выгодной инвестицией.",
            "Зелёные зоны могут влиять на стоимость жилья рядом.",
            "В исследовании участвовали пять европейских городов.",
            "Затраты на здравоохранение выросли из-за парков.",
          ].map((q, i) => (
            <div key={i} className="space-y-2 rounded-lg border p-3">
              <p className="text-sm">
                {i + 1}. {q}
              </p>
              <div className="flex gap-2">
                {["True", "False", "Not Given"].map((opt) => (
                  <span
                    key={opt}
                    className="rounded-md border bg-secondary/40 px-2.5 py-1 text-xs text-muted-foreground"
                  >
                    {opt}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

/* ------------------------------- Writing ------------------------------- */
function WritingSession() {
  const [task, setTask] = React.useState<1 | 2>(1);
  const [text, setText] = React.useState("");
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const minWords = task === 1 ? 150 : 250;
  const prompt =
    task === 1
      ? "График показывает изменение числа посетителей трёх музеев города с 2010 по 2020 год. Опишите основные тенденции и сравните показатели. Минимум 150 слов."
      : "Некоторые считают, что онлайн-обучение вскоре полностью заменит традиционные классы. В какой степени вы согласны? Приведите аргументы и примеры. Минимум 250 слов.";
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        {([1, 2] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTask(t)}
            className={cn(
              "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
              task === t
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground hover:text-foreground"
            )}
          >
            Task {t}
          </button>
        ))}
      </div>

      <Card>
        <CardContent className="space-y-1.5 p-5">
          <p className="text-xs font-medium uppercase tracking-wider text-primary">
            Задание · Task {task}
          </p>
          <p className="text-sm leading-relaxed">{prompt}</p>
        </CardContent>
      </Card>

      <div className="space-y-2">
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Начните писать ответ здесь…"
          className="min-h-[260px] resize-y"
          aria-label="Текст ответа"
        />
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span
            className={cn("tabular", words >= minWords && "text-success")}
          >
            {words} слов · минимум {minWords}
          </span>
          <span className="tabular inline-flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" /> {task === 1 ? "20:00" : "40:00"}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------ Speaking ------------------------------- */
function SpeakingSession() {
  const [recording, setRecording] = React.useState(false);
  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="space-y-2 p-5">
          <Badge variant="secondary">Part 2 · Cue card</Badge>
          <p className="text-sm leading-relaxed">
            Опишите книгу, которая произвела на вас впечатление. Расскажите:
          </p>
          <ul className="ml-4 list-disc space-y-1 text-sm text-muted-foreground">
            <li>что это за книга;</li>
            <li>о чём она;</li>
            <li>когда вы её прочитали;</li>
            <li>и объясните, почему она вам запомнилась.</li>
          </ul>
          <p className="tabular text-xs text-muted-foreground">
            Подготовка: 1 минута · Ответ: до 2 минут
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-col items-center gap-3 p-8 text-center">
          <button
            onClick={() => setRecording((v) => !v)}
            aria-label={recording ? "Остановить запись" : "Начать запись"}
            className={cn(
              "flex h-16 w-16 items-center justify-center rounded-full ring-4 transition-all",
              recording
                ? "animate-pulse-dot bg-destructive text-destructive-foreground ring-destructive/20"
                : "bg-primary text-primary-foreground ring-primary/20 hover:-translate-y-0.5"
            )}
          >
            <Mic className="h-6 w-6" />
          </button>
          <p className="text-sm font-medium">
            {recording ? "Идёт запись…" : "Нажмите, чтобы записать ответ"}
          </p>
          <p className="tabular text-xs text-muted-foreground">
            {recording ? "00:12" : "00:00"} / 02:00
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

const SESSION: Record<Skill, () => React.ReactElement> = {
  listening: ListeningSession,
  reading: ReadingSession,
  writing: WritingSession,
  speaking: SpeakingSession,
};

export function PracticeSession({ section }: { section: Skill }) {
  const meta = SECTION_META[section];
  const Body = SESSION[section];
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            href="/student/practice"
            className="flex h-8 w-8 items-center justify-center rounded-md border bg-card text-muted-foreground shadow-sm transition-colors hover:text-foreground"
            aria-label="Назад к практике"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h2 className="font-display text-lg font-semibold leading-tight">
              {meta.name}{" "}
              <span className="text-muted-foreground">· {meta.ru}</span>
            </h2>
            <p className="text-xs text-muted-foreground">Тренировочная сессия</p>
          </div>
          <Badge>Демо</Badge>
        </div>
        <span className="tabular inline-flex items-center gap-1.5 rounded-full border bg-card px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm">
          <Clock className="h-3.5 w-3.5 text-primary" /> 60:00
        </span>
      </div>

      <Body />

      <DemoNote />

      <div className="flex justify-end gap-2">
        <Button variant="outline" disabled>
          Сохранить черновик
        </Button>
        <Button disabled>Завершить и отправить</Button>
      </div>
    </div>
  );
}
