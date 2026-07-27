"use client";

import * as React from "react";
import {
  GripVertical,
  Maximize2,
  MessageSquare,
  Mic,
  MicOff,
  Minus,
  PhoneOff,
  Send,
  Video,
  VideoOff,
} from "lucide-react";
import { useApp } from "@/components/app-provider";
import { TEACHERS } from "@/lib/admin-data";
import { cn } from "@/lib/utils";
import { useClassroom } from "./classroom-provider";

const WIDGET_WIDTH = 300;
const MARGIN = 16;

function formatElapsed(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

interface ChatMessage {
  id: number;
  author: "teacher" | "student";
  text: string;
}

const SEEDED_CHAT: ChatMessage[] = [
  {
    id: 1,
    author: "teacher",
    text: "Начнём с Passage 1. Прочитайте первый абзац и отметьте незнакомые слова.",
  },
  {
    id: 2,
    author: "student",
    text: "Хорошо. Не понял слово «resilient» во втором абзаце.",
  },
  {
    id: 3,
    author: "teacher",
    text: "Выделите его и сохраните в словарь — разберём после теста.",
  },
];

/**
 * Interface mock of a live lesson call.
 *
 * No WebRTC: the tiles are simulated so the flow can be demonstrated and
 * reviewed. Draggable and collapsible because it shares the screen with the
 * reading passage and must never sit on top of the text the student is reading.
 */
export function VideoCallWidget() {
  const {
    collapsed,
    setCollapsed,
    micOn,
    toggleMic,
    cameraOn,
    toggleCamera,
    chatOpen,
    setChatOpen,
    elapsed,
    setMode,
  } = useClassroom();
  const { activeStudent } = useApp();

  const teacher = TEACHERS[0];
  const studentName = activeStudent?.name ?? "Студент";
  const studentInitials = activeStudent?.initials ?? "СТ";

  const [pos, setPos] = React.useState<{ x: number; y: number } | null>(null);
  const [messages, setMessages] = React.useState<ChatMessage[]>(SEEDED_CHAT);
  const [draft, setDraft] = React.useState("");
  const dragRef = React.useRef<{ dx: number; dy: number } | null>(null);
  const nodeRef = React.useRef<HTMLDivElement>(null);

  // Park it bottom-right on first paint; measured rather than guessed so the
  // collapsed and expanded sizes both land inside the viewport.
  React.useEffect(() => {
    if (pos) return;
    const height = nodeRef.current?.offsetHeight ?? 420;
    setPos({
      x: window.innerWidth - WIDGET_WIDTH - MARGIN,
      y: window.innerHeight - height - MARGIN,
    });
  }, [pos]);

  const clamp = React.useCallback((x: number, y: number) => {
    const node = nodeRef.current;
    const w = node?.offsetWidth ?? WIDGET_WIDTH;
    const h = node?.offsetHeight ?? 420;
    return {
      x: Math.min(Math.max(x, MARGIN), window.innerWidth - w - MARGIN),
      y: Math.min(Math.max(y, MARGIN), window.innerHeight - h - MARGIN),
    };
  }, []);

  React.useEffect(() => {
    function onMove(e: PointerEvent) {
      if (!dragRef.current) return;
      setPos(clamp(e.clientX - dragRef.current.dx, e.clientY - dragRef.current.dy));
    }
    function onUp() {
      dragRef.current = null;
      document.body.style.userSelect = "";
    }
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [clamp]);

  // Keep it on screen when the window resizes under it.
  React.useEffect(() => {
    function onResize() {
      setPos((p) => (p ? clamp(p.x, p.y) : p));
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [clamp]);

  // The widget's own height changes when the chat opens or it collapses. Without
  // re-clamping, opening the chat pushed the control bar — including "end
  // lesson" — off the bottom of the screen.
  React.useEffect(() => {
    const node = nodeRef.current;
    if (!node || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => {
      setPos((p) => (p ? clamp(p.x, p.y) : p));
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, [clamp]);

  function startDrag(e: React.PointerEvent) {
    const rect = nodeRef.current?.getBoundingClientRect();
    if (!rect) return;
    dragRef.current = { dx: e.clientX - rect.left, dy: e.clientY - rect.top };
    document.body.style.userSelect = "none";
  }

  function sendMessage() {
    const text = draft.trim();
    if (!text) return;
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), author: "student", text },
    ]);
    setDraft("");
  }

  return (
    <div
      ref={nodeRef}
      style={{
        left: pos?.x ?? 0,
        top: pos?.y ?? 0,
        width: WIDGET_WIDTH,
        visibility: pos ? "visible" : "hidden",
      }}
      className="fixed z-50 overflow-hidden rounded-2xl border bg-card shadow-raised"
      role="region"
      aria-label="Онлайн-урок"
    >
      {/* Drag handle / header */}
      <div
        onPointerDown={startDrag}
        className="flex cursor-grab items-center gap-2 border-b bg-primary px-3 py-2 text-primary-foreground active:cursor-grabbing"
      >
        <GripVertical className="h-4 w-4 shrink-0 opacity-70" aria-hidden />
        <span className="flex items-center gap-1.5 text-xs font-semibold">
          <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-white" />
          Урок с учителем
        </span>
        <span className="tabular ml-auto text-xs opacity-90">
          {formatElapsed(elapsed)}
        </span>
        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? "Развернуть окно" : "Свернуть окно"}
          className="rounded-md p-1 transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
        >
          {collapsed ? (
            <Maximize2 className="h-3.5 w-3.5" />
          ) : (
            <Minus className="h-3.5 w-3.5" />
          )}
        </button>
      </div>

      {!collapsed && (
        <>
          <div className="space-y-2 p-2.5">
            <VideoTile
              name={teacher.name}
              role="Преподаватель"
              initials={teacher.initials}
              cameraOn
              speaking
            />
            <VideoTile
              name={studentName}
              role="Студент"
              initials={studentInitials}
              cameraOn={cameraOn}
              speaking={micOn}
              muted={!micOn}
            />
          </div>

          {chatOpen && (
            <div className="border-t">
              <div className="slim-scroll max-h-40 space-y-2 overflow-y-auto px-3 py-2.5">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={cn(
                      "max-w-[85%] rounded-xl px-2.5 py-1.5 text-xs leading-relaxed",
                      m.author === "teacher"
                        ? "bg-secondary text-secondary-foreground"
                        : "ml-auto bg-primary/10 text-foreground"
                    )}
                  >
                    <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {m.author === "teacher" ? "Преподаватель" : "Вы"}
                    </p>
                    {m.text}
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-1.5 border-t p-2">
                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  placeholder="Сообщение…"
                  aria-label="Сообщение в чат урока"
                  className="h-8 flex-1 rounded-lg border border-input bg-transparent px-2.5 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
                <button
                  type="button"
                  onClick={sendMessage}
                  disabled={!draft.trim()}
                  aria-label="Отправить"
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-opacity disabled:opacity-40"
                >
                  <Send className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Control bar — always reachable, even collapsed. */}
      <div className="flex items-center justify-center gap-1.5 border-t bg-secondary/50 px-2.5 py-2">
        <ControlButton
          label={micOn ? "Выключить микрофон" : "Включить микрофон"}
          onClick={toggleMic}
          active={micOn}
          danger={!micOn}
        >
          {micOn ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
        </ControlButton>
        <ControlButton
          label={cameraOn ? "Выключить камеру" : "Включить камеру"}
          onClick={toggleCamera}
          active={cameraOn}
          danger={!cameraOn}
        >
          {cameraOn ? (
            <Video className="h-4 w-4" />
          ) : (
            <VideoOff className="h-4 w-4" />
          )}
        </ControlButton>
        <ControlButton
          label="Чат урока"
          onClick={() => {
            setChatOpen(!chatOpen);
            if (collapsed) setCollapsed(false);
          }}
          active={chatOpen}
        >
          <MessageSquare className="h-4 w-4" />
        </ControlButton>
        <button
          type="button"
          onClick={() => setMode("solo")}
          aria-label="Завершить урок"
          title="Завершить урок"
          className="ml-1 flex h-9 items-center gap-1.5 rounded-xl bg-destructive px-3 text-xs font-semibold text-destructive-foreground shadow-sm transition-transform hover:brightness-110 active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <PhoneOff className="h-4 w-4" />
          Завершить
        </button>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */

function ControlButton({
  label,
  onClick,
  active,
  danger,
  children,
}: {
  label: string;
  onClick: () => void;
  active?: boolean;
  danger?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      title={label}
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-xl transition-all hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        danger
          ? "bg-destructive/12 text-destructive"
          : active
            ? "bg-primary/12 text-primary"
            : "bg-card text-muted-foreground hover:text-foreground"
      )}
    >
      {children}
    </button>
  );
}

/**
 * One participant tile. Camera-on shows a placeholder feed with the avatar over
 * it; camera-off falls back to the avatar on a flat surface, the way a real
 * call does.
 */
function VideoTile({
  name,
  role,
  initials,
  cameraOn,
  speaking,
  muted,
}: {
  name: string;
  role: string;
  initials: string;
  cameraOn: boolean;
  speaking?: boolean;
  muted?: boolean;
}) {
  return (
    <div
      className={cn(
        "relative aspect-video overflow-hidden rounded-xl ring-1 transition-shadow",
        speaking ? "ring-2 ring-primary" : "ring-border"
      )}
    >
      {cameraOn ? (
        <div className="absolute inset-0 bg-gradient-to-br from-primary/25 via-accent/15 to-secondary" />
      ) : (
        <div className="absolute inset-0 bg-secondary" />
      )}

      <div className="relative flex h-full items-center justify-center">
        <span
          className={cn(
            "flex h-12 w-12 items-center justify-center rounded-full text-sm font-bold shadow-sm",
            cameraOn
              ? "bg-card/90 text-primary"
              : "bg-card text-muted-foreground"
          )}
        >
          {initials}
        </span>
      </div>

      {/* Camera state, mirroring what a real client shows. */}
      <span className="absolute right-1.5 top-1.5 rounded-md bg-black/45 px-1.5 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
        {cameraOn ? "Камера включена" : "Камера выключена"}
      </span>

      {/* Name plate with live mic meter. */}
      <div className="absolute inset-x-1.5 bottom-1.5 flex items-center gap-1.5 rounded-lg bg-black/50 px-2 py-1 backdrop-blur-sm">
        {muted ? (
          <MicOff className="h-3 w-3 shrink-0 text-destructive" aria-hidden />
        ) : (
          <span
            className="flex h-3 items-end gap-[2px]"
            aria-hidden
            title="Микрофон активен"
          >
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className={cn(
                  "mic-bar w-[3px] rounded-full bg-success",
                  speaking ? "h-3" : "h-1.5"
                )}
                style={speaking ? undefined : { animation: "none" }}
              />
            ))}
          </span>
        )}
        <span className="min-w-0 flex-1 truncate text-[11px] font-medium text-white">
          {name}
        </span>
        <span className="shrink-0 text-[10px] uppercase tracking-wider text-white/70">
          {role}
        </span>
      </div>
    </div>
  );
}
