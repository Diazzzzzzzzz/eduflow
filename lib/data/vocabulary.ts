/**
 * SERVER ONLY — personal vocabulary storage.
 *
 * Falls back to an in-memory copy of the demo set when Supabase isn't
 * configured, matching the convention in `lib/data/students.ts` so the feature
 * stays demonstrable without a database.
 */

import { createAdminClient } from "@/lib/supabase/server";
import {
  DEMO_VOCABULARY,
  normalizeTerm,
  type VocabEntry,
  type VocabSource,
  type VocabStatus,
} from "@/lib/vocabulary-data";

const CENTER_ID = "11111111-1111-1111-1111-111111111111";

interface VocabRow {
  id: string;
  term: string;
  phonetic: string | null;
  translation: string;
  example: string | null;
  source: VocabSource;
  topic: string | null;
  status: VocabStatus;
  created_at: string;
}

function rowToEntry(r: VocabRow): VocabEntry {
  return {
    id: r.id,
    term: r.term,
    phonetic: r.phonetic,
    translation: r.translation,
    example: r.example,
    source: r.source,
    topic: r.topic,
    status: r.status,
    createdAt: r.created_at,
  };
}

/** Deterministic demo list, used when there is no database. */
function demoEntries(): VocabEntry[] {
  return DEMO_VOCABULARY.map((w, i) => ({
    id: `demo-${i + 1}`,
    term: w.term,
    phonetic: w.phonetic,
    translation: w.translation,
    example: w.example,
    source: w.source,
    topic: w.topic,
    status: w.status ?? "new",
    createdAt: new Date(2026, 6, 1 + i).toISOString(),
  }));
}

export async function listVocabulary(
  studentId: string
): Promise<{ entries: VocabEntry[]; source: "supabase" | "mock" }> {
  const supabase = createAdminClient();
  if (!supabase) return { entries: demoEntries(), source: "mock" };

  try {
    const res = await supabase
      .from("vocabulary_entries")
      .select(
        "id, term, phonetic, translation, example, source, topic, status, created_at"
      )
      .eq("student_id", studentId)
      .order("created_at", { ascending: false });

    if (res.error || !res.data) return { entries: demoEntries(), source: "mock" };
    return {
      entries: (res.data as unknown as VocabRow[]).map(rowToEntry),
      source: "supabase",
    };
  } catch {
    return { entries: demoEntries(), source: "mock" };
  }
}

export interface SaveWordInput {
  studentId: string;
  term: string;
  translation: string;
  phonetic?: string | null;
  example?: string | null;
  source?: VocabSource;
  topic?: string | null;
}

/**
 * Add a word, or refresh it if the student already has it.
 *
 * Saving the same word twice from a different passage updates the example
 * rather than creating a second card — the unique key is (student, term).
 */
export async function saveWord(
  input: SaveWordInput
): Promise<{ ok: boolean; error?: string; entry?: VocabEntry; existed?: boolean }> {
  const term = normalizeTerm(input.term);
  if (!term) return { ok: false, error: "Пустое слово" };
  if (!input.translation.trim()) {
    return { ok: false, error: "Нужен перевод" };
  }

  const supabase = createAdminClient();
  if (!supabase) {
    return { ok: false, error: "База данных не настроена — слово не сохранено." };
  }

  try {
    const existing = await supabase
      .from("vocabulary_entries")
      .select("id")
      .eq("student_id", input.studentId)
      .eq("term", term)
      .maybeSingle();
    const existed = !!(existing.data as unknown as { id: string } | null);

    const res = await supabase
      .from("vocabulary_entries")
      .upsert(
        {
          center_id: CENTER_ID,
          student_id: input.studentId,
          term,
          phonetic: input.phonetic ?? null,
          translation: input.translation.trim(),
          example: input.example ?? null,
          source: input.source ?? "student",
          topic: input.topic ?? null,
          updated_at: new Date().toISOString(),
        } as never,
        { onConflict: "student_id,term" }
      )
      .select(
        "id, term, phonetic, translation, example, source, topic, status, created_at"
      )
      .maybeSingle();

    if (res.error) return { ok: false, error: res.error.message };
    const row = res.data as unknown as VocabRow | null;
    return {
      ok: true,
      existed,
      entry: row ? rowToEntry(row) : undefined,
    };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Не удалось сохранить",
    };
  }
}

export async function setWordStatus(
  studentId: string,
  id: string,
  status: VocabStatus
): Promise<{ ok: boolean; error?: string }> {
  const supabase = createAdminClient();
  if (!supabase) return { ok: false, error: "База данных не настроена." };
  const { error } = await supabase
    .from("vocabulary_entries")
    .update({ status, updated_at: new Date().toISOString() } as never)
    .eq("student_id", studentId)
    .eq("id", id);
  return error ? { ok: false, error: error.message } : { ok: true };
}

export async function deleteWord(
  studentId: string,
  id: string
): Promise<{ ok: boolean; error?: string }> {
  const supabase = createAdminClient();
  if (!supabase) return { ok: false, error: "База данных не настроена." };
  const { error } = await supabase
    .from("vocabulary_entries")
    .delete()
    .eq("student_id", studentId)
    .eq("id", id);
  return error ? { ok: false, error: error.message } : { ok: true };
}
