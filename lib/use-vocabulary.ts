"use client";

import * as React from "react";
import type { VocabEntry, VocabStatus } from "@/lib/vocabulary-data";

export interface VocabularyState {
  entries: VocabEntry[];
  status: "loading" | "ready" | "error";
  /** True when the list is the bundled demo set rather than the database. */
  demo: boolean;
  reload: () => void;
  addWord: (input: {
    term: string;
    translation: string;
    phonetic?: string | null;
    example?: string | null;
    topic?: string | null;
  }) => Promise<{ ok: boolean; error?: string; existed?: boolean }>;
  setStatus: (id: string, status: VocabStatus) => Promise<boolean>;
  removeWord: (id: string) => Promise<boolean>;
}

/** Loads and mutates one student's vocabulary. */
export function useVocabulary(studentId: string | undefined): VocabularyState {
  const [entries, setEntries] = React.useState<VocabEntry[]>([]);
  const [status, setStatusState] =
    React.useState<VocabularyState["status"]>("loading");
  const [demo, setDemo] = React.useState(false);
  const [tick, setTick] = React.useState(0);

  React.useEffect(() => {
    if (!studentId) return;
    let cancelled = false;
    setStatusState("loading");

    (async () => {
      try {
        const res = await fetch(
          `/api/vocabulary?studentId=${encodeURIComponent(studentId)}`
        );
        if (!res.ok) throw new Error(String(res.status));
        const data = (await res.json()) as {
          entries: VocabEntry[];
          source: "supabase" | "mock";
        };
        if (cancelled) return;
        setEntries(data.entries ?? []);
        setDemo(data.source === "mock");
        setStatusState("ready");
      } catch {
        if (!cancelled) setStatusState("error");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [studentId, tick]);

  const reload = React.useCallback(() => setTick((t) => t + 1), []);

  const addWord = React.useCallback<VocabularyState["addWord"]>(
    async (input) => {
      if (!studentId) return { ok: false, error: "Студент не выбран" };
      try {
        const res = await fetch("/api/vocabulary", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ studentId, ...input }),
        });
        const body = (await res.json()) as {
          error?: string;
          existed?: boolean;
          entry?: VocabEntry;
        };
        if (!res.ok) return { ok: false, error: body.error ?? "Не удалось сохранить" };
        reload();
        return { ok: true, existed: body.existed };
      } catch {
        return { ok: false, error: "Нет соединения с сервером" };
      }
    },
    [studentId, reload]
  );

  const setWordStatus = React.useCallback(
    async (id: string, next: VocabStatus) => {
      if (!studentId) return false;
      // Optimistic: flashcards feel wrong with a round-trip between cards.
      const previous = entries;
      setEntries((prev) =>
        prev.map((e) => (e.id === id ? { ...e, status: next } : e))
      );
      try {
        const res = await fetch("/api/vocabulary", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ studentId, id, status: next }),
        });
        if (!res.ok) {
          setEntries(previous);
          return false;
        }
        return true;
      } catch {
        setEntries(previous);
        return false;
      }
    },
    [studentId, entries]
  );

  const removeWord = React.useCallback(
    async (id: string) => {
      if (!studentId) return false;
      const previous = entries;
      setEntries((prev) => prev.filter((e) => e.id !== id));
      try {
        const res = await fetch(
          `/api/vocabulary?id=${encodeURIComponent(id)}&studentId=${encodeURIComponent(studentId)}`,
          { method: "DELETE" }
        );
        if (!res.ok) {
          setEntries(previous);
          return false;
        }
        return true;
      } catch {
        setEntries(previous);
        return false;
      }
    },
    [studentId, entries]
  );

  return {
    entries,
    status,
    demo,
    reload,
    addWord,
    setStatus: setWordStatus,
    removeWord,
  };
}

/** Browser speech synthesis for a flashcard, when the platform offers it. */
export function useSpeech() {
  const [supported, setSupported] = React.useState(false);
  const [speaking, setSpeaking] = React.useState(false);

  React.useEffect(() => {
    setSupported(typeof window !== "undefined" && "speechSynthesis" in window);
  }, []);

  const speak = React.useCallback(
    (text: string) => {
      if (!supported) return;
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-GB";
      utterance.rate = 0.9;
      utterance.onstart = () => setSpeaking(true);
      utterance.onend = () => setSpeaking(false);
      utterance.onerror = () => setSpeaking(false);
      window.speechSynthesis.speak(utterance);
    },
    [supported]
  );

  return { speak, supported, speaking };
}
