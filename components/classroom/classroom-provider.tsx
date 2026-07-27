"use client";

import * as React from "react";
import { VideoCallWidget } from "./video-call-widget";

export type LessonMode = "solo" | "live";

interface ClassroomState {
  mode: LessonMode;
  setMode: (next: LessonMode) => void;
  /** Widget collapsed into its compact pill. */
  collapsed: boolean;
  setCollapsed: (next: boolean) => void;
  micOn: boolean;
  toggleMic: () => void;
  cameraOn: boolean;
  toggleCamera: () => void;
  chatOpen: boolean;
  setChatOpen: (next: boolean) => void;
  /** Seconds since the live lesson started. */
  elapsed: number;
}

const ClassroomContext = React.createContext<ClassroomState | null>(null);

const SESSION_KEY = "eduflow:lesson-mode";

/**
 * Holds the lesson mode and call controls for the whole app, and mounts the
 * floating widget once.
 *
 * App-level rather than per-page so a live lesson survives moving between the
 * test room and the lesson materials — which is exactly what a student does
 * while a teacher is talking them through a passage.
 *
 * Mode lives in sessionStorage: a reload during a lesson keeps you in it, but a
 * new tab starts on your own, which matches how a call behaves.
 */
export function ClassroomProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = React.useState<LessonMode>("solo");
  const [collapsed, setCollapsed] = React.useState(false);
  const [micOn, setMicOn] = React.useState(true);
  const [cameraOn, setCameraOn] = React.useState(true);
  const [chatOpen, setChatOpen] = React.useState(false);
  const [elapsed, setElapsed] = React.useState(0);

  React.useEffect(() => {
    try {
      if (sessionStorage.getItem(SESSION_KEY) === "live") setModeState("live");
    } catch {
      // Private mode — start on your own.
    }
  }, []);

  const setMode = React.useCallback((next: LessonMode) => {
    setModeState(next);
    try {
      sessionStorage.setItem(SESSION_KEY, next);
    } catch {
      // Nothing to persist to; the mode still applies for this view.
    }
    if (next === "live") {
      // A fresh call starts open, unmuted and timing from zero.
      setCollapsed(false);
      setMicOn(true);
      setCameraOn(true);
      setElapsed(0);
    } else {
      setChatOpen(false);
    }
  }, []);

  // Call timer, only while live.
  React.useEffect(() => {
    if (mode !== "live") return;
    const id = window.setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => window.clearInterval(id);
  }, [mode]);

  const value: ClassroomState = {
    mode,
    setMode,
    collapsed,
    setCollapsed,
    micOn,
    toggleMic: () => setMicOn((m) => !m),
    cameraOn,
    toggleCamera: () => setCameraOn((c) => !c),
    chatOpen,
    setChatOpen,
    elapsed,
  };

  return (
    <ClassroomContext.Provider value={value}>
      {children}
      {mode === "live" && <VideoCallWidget />}
    </ClassroomContext.Provider>
  );
}

export function useClassroom() {
  const ctx = React.useContext(ClassroomContext);
  if (!ctx) {
    throw new Error("useClassroom must be used within ClassroomProvider");
  }
  return ctx;
}
