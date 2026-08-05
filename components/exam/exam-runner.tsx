"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  ClipboardList,
  FileText,
  GripVertical,
  Link2,
  Link2Off,
  Maximize,
  Minimize,
  RotateCw,
} from "lucide-react";
import { useApp } from "@/components/app-provider";
import { useFocusModeWhile } from "@/components/layout/focus-mode";
import { useFullscreen } from "@/lib/use-fullscreen";
import { LessonModeSwitch } from "@/components/classroom/lesson-mode-switch";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { ExamSection } from "@/lib/exam/types";
import { ExamSessionProvider, useExamSession } from "./exam-session";
import { ExamTimer } from "./exam-timer";
import { PassageReader } from "./passage-reader";
import { QuestionPanel } from "./question-panel";
import { ReviewPanel } from "./review-panel";
import { ResultsView } from "./results-view";

const MIN_PANE = 25;
const MAX_PANE = 75;

/** Two panes with a draggable divider and optional linked scrolling. */
function SplitView({ passageIndex }: { passageIndex: number }) {
  const { section } = useExamSession();
  const passage = section.passages[passageIndex];

  const [leftPct, setLeftPct] = React.useState(52);
  const [synced, setSynced] = React.useState(false);
  const [mobileTab, setMobileTab] = React.useState<"text" | "questions">("text");

  const containerRef = React.useRef<HTMLDivElement>(null);
  const leftScroll = React.useRef<HTMLDivElement>(null);
  const rightScroll = React.useRef<HTMLDivElement>(null);
  const dragging = React.useRef(false);
  // Prevents the two scroll handlers from driving each other in a loop.
  const syncing = React.useRef(false);

  // --- divider ------------------------------------------------------------
  React.useEffect(() => {
    function onMove(e: PointerEvent) {
      if (!dragging.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const pct = ((e.clientX - rect.left) / rect.width) * 100;
      setLeftPct(Math.min(MAX_PANE, Math.max(MIN_PANE, pct)));
    }
    function onUp() {
      dragging.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    }
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, []);

  // --- linked scrolling ---------------------------------------------------
  React.useEffect(() => {
    if (!synced) return;
    const left = leftScroll.current;
    const right = rightScroll.current;
    if (!left || !right) return;

    function link(from: HTMLDivElement, to: HTMLDivElement) {
      return () => {
        if (syncing.current) return;
        syncing.current = true;
        const fromMax = from.scrollHeight - from.clientHeight;
        const toMax = to.scrollHeight - to.clientHeight;
        if (fromMax > 0 && toMax > 0) {
          to.scrollTop = (from.scrollTop / fromMax) * toMax;
        }
        // Release after the paired scroll event has been dispatched.
        window.requestAnimationFrame(() => {
          syncing.current = false;
        });
      };
    }

    const onLeft = link(left, right);
    const onRight = link(right, left);
    left.addEventListener("scroll", onLeft, { passive: true });
    right.addEventListener("scroll", onRight, { passive: true });
    return () => {
      left.removeEventListener("scroll", onLeft);
      right.removeEventListener("scroll", onRight);
    };
  }, [synced, passageIndex]);

  return (
    <>
      {/* Mobile: one pane at a time */}
      <div className="flex items-center gap-1 rounded-lg bg-secondary p-1 lg:hidden">
        {(
          [
            ["text", "Текст", FileText],
            ["questions", "Вопросы", ClipboardList],
          ] as const
        ).map(([key, label, Icon]) => (
          <button
            key={key}
            type="button"
            onClick={() => setMobileTab(key)}
            aria-pressed={mobileTab === key}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-all",
              mobileTab === key
                ? "bg-card text-foreground shadow"
                : "text-muted-foreground"
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      <div
        ref={containerRef}
        className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border bg-card shadow-card lg:flex-row"
      >
        <div
          className={cn(
            "min-h-0 flex-1 lg:flex-none",
            mobileTab === "text" ? "flex" : "hidden lg:flex"
          )}
          style={{ width: `${leftPct}%` }}
        >
          <div className="min-h-0 w-full">
            <PassageReader passage={passage} scrollRef={leftScroll} />
          </div>
        </div>

        {/* Divider */}
        <div
          role="separator"
          aria-orientation="vertical"
          aria-label="Изменить ширину панелей"
          tabIndex={0}
          onPointerDown={() => {
            dragging.current = true;
            document.body.style.cursor = "col-resize";
            document.body.style.userSelect = "none";
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowLeft") setLeftPct((p) => Math.max(MIN_PANE, p - 2));
            if (e.key === "ArrowRight") setLeftPct((p) => Math.min(MAX_PANE, p + 2));
          }}
          className="group hidden w-1.5 shrink-0 cursor-col-resize items-center justify-center border-x bg-secondary/50 transition-colors hover:bg-primary/20 focus-visible:outline-none focus-visible:bg-primary/30 lg:flex"
        >
          <GripVertical className="h-4 w-4 text-muted-foreground/40 transition-colors group-hover:text-primary" />
        </div>

        <div
          className={cn(
            "min-h-0 flex-1 border-t lg:border-t-0",
            mobileTab === "questions" ? "flex" : "hidden lg:flex"
          )}
        >
          <div className="min-h-0 w-full">
            <QuestionPanel passage={passage} scrollRef={rightScroll} />
          </div>
        </div>
      </div>

      <div className="hidden justify-end lg:flex">
        <button
          type="button"
          onClick={() => setSynced((s) => !s)}
          aria-pressed={synced}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium transition-colors",
            synced
              ? "text-primary"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {synced ? (
            <Link2 className="h-3.5 w-3.5" />
          ) : (
            <Link2Off className="h-3.5 w-3.5" />
          )}
          {synced ? "Прокрутка связана" : "Прокрутка независима"}
        </button>
      </div>
    </>
  );
}

function ExamShell({ backHref }: { backHref: string }) {
  const {
    section,
    phase,
    activePassage,
    setActivePassage,
    answeredCount,
    totalQuestions,
    openReview,
    result,
    restart,
    resumed,
    restored,
  } = useExamSession();
  const { uiTheme } = useApp();
  const fullscreen = useFullscreen();

  const [dismissedResume, setDismissedResume] = React.useState(false);

  // Full-screen for the attempt itself, including the review step. The results
  // screen deliberately drops out of it — by then the student wants the
  // navigation back.
  useFocusModeWhile(phase !== "done");

  if (phase === "done" && result) {
    return (
      <ResultsView section={section} result={result} onRestart={restart} />
    );
  }

  if (phase === "review" || phase === "submitting") {
    // Focus mode fixes the viewport height, so the review list needs its own
    // scroll container or its tail would be unreachable.
    return (
      <div className="min-h-0 flex-1 overflow-y-auto p-3 sm:p-4">
        <ReviewPanel />
      </div>
    );
  }

  const isLast = activePassage === section.passages.length - 1;

  return (
    // Fills the focus-mode viewport exactly: `min-h-0` at every level lets the
    // two panes scroll internally instead of pushing the page taller. Height is
    // inherited rather than computed from the chrome, so nothing has to be kept
    // in sync with a `calc()`.
    <div className="flex min-h-0 flex-1 flex-col gap-3 p-3 sm:p-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            href={backHref}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border bg-card text-muted-foreground shadow-sm transition-colors hover:text-foreground"
            aria-label="Выйти из теста"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="min-w-0">
            <h1 className="truncate font-display text-base font-semibold leading-tight">
              {section.title}
            </h1>
            <p className="truncate text-xs text-muted-foreground">
              {section.attribution}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <LessonModeSwitch />
          <span className="tabular hidden rounded-full border bg-card px-3 py-1 text-xs text-muted-foreground sm:inline">
            {answeredCount}/{totalQuestions} отвечено
          </span>
          <ExamTimer />
          {/* The browser's own fullscreen, on top of the app's focus mode:
              focus mode hides EduFlow's chrome, this hides the browser's.
              Entering needs a user gesture, so it has to be a button. */}
          {fullscreen.supported && (
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={fullscreen.toggle}
              aria-pressed={fullscreen.active}
              aria-label={
                fullscreen.active
                  ? "Выйти из полноэкранного режима"
                  : "Полноэкранный режим"
              }
              title={
                fullscreen.active
                  ? "Выйти из полноэкранного режима"
                  : "Полноэкранный режим"
              }
            >
              {fullscreen.active ? (
                <Minimize className="h-4 w-4" />
              ) : (
                <Maximize className="h-4 w-4" />
              )}
            </Button>
          )}
          <Button size="sm" onClick={openReview}>
            <ClipboardList /> Проверить и сдать
          </Button>
        </div>
      </div>

      {/* Modern only: a session meter across the top of the test room. Classic
          keeps its compact counter chip and is left untouched. */}
      {uiTheme === "modern" && (
        <div className="space-y-1.5">
          <Progress
            value={(answeredCount / Math.max(totalQuestions, 1)) * 100}
            aria-label={`Отвечено ${answeredCount} из ${totalQuestions}`}
            indicatorClassName={
              answeredCount === totalQuestions ? "bg-success" : undefined
            }
          />
          <div className="tabular flex items-center justify-between text-xs text-muted-foreground">
            <span>
              Отвечено {answeredCount} из {totalQuestions}
            </span>
            <span>
              {Math.round((answeredCount / Math.max(totalQuestions, 1)) * 100)}%
            </span>
          </div>
        </div>
      )}

      {restored && resumed && !dismissedResume && (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-primary/25 bg-primary/5 px-3 py-2 text-sm">
          <span className="flex items-center gap-2">
            <RotateCw className="h-4 w-4 shrink-0 text-primary" />
            Сессия восстановлена — ваши ответы и время сохранились.
          </span>
          <button
            type="button"
            onClick={() => setDismissedResume(true)}
            className="shrink-0 text-xs font-medium text-primary hover:underline"
          >
            Понятно
          </button>
        </div>
      )}

      {/* Passage tabs */}
      <div className="flex flex-wrap items-center gap-1.5">
        {section.passages.map((p, i) => {
          const first = p.groups[0]?.from ?? 0;
          const last = p.groups[p.groups.length - 1]?.to ?? 0;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => setActivePassage(i)}
              aria-current={activePassage === i}
              className={cn(
                "rounded-md border px-3 py-1.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                activePassage === i
                  ? "border-primary bg-primary/10 font-medium text-primary"
                  : "bg-card text-muted-foreground hover:bg-secondary"
              )}
            >
              Текст {p.number}
              <span className="tabular ml-1.5 text-xs opacity-70">
                {first}–{last}
              </span>
            </button>
          );
        })}
      </div>

      <SplitView passageIndex={activePassage} />

      {/* Footer nav */}
      <div className="flex items-center justify-between gap-3">
        <Button
          variant="outline"
          size="sm"
          disabled={activePassage === 0}
          onClick={() => setActivePassage(activePassage - 1)}
        >
          <ArrowLeft /> Предыдущий
        </Button>
        {isLast ? (
          <Button size="sm" onClick={openReview}>
            <ClipboardList /> К проверке
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setActivePassage(activePassage + 1)}
          >
            Следующий <ArrowRight />
          </Button>
        )}
      </div>
    </div>
  );
}

export function ExamRunner({
  section,
  studentId,
  backHref = "/student/practice",
}: {
  section: ExamSection;
  studentId?: string | null;
  backHref?: string;
}) {
  return (
    <ExamSessionProvider section={section} studentId={studentId}>
      <ExamShell backHref={backHref} />
    </ExamSessionProvider>
  );
}
