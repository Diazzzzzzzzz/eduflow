/**
 * SERVER ONLY — imported exam papers.
 *
 * Papers are stored whole as JSONB, answer keys included. Nothing here strips
 * keys; that is `toPublicSection`'s job at the API boundary.
 */

import { createAdminClient } from "@/lib/supabase/server";
import type { ExamSectionFull } from "@/lib/exam/types";

const CENTER_ID = "11111111-1111-1111-1111-111111111111";

export interface PaperSummary {
  slug: string;
  title: string;
  skill: "reading" | "listening";
  durationMinutes: number;
  attribution: string | null;
  passages: number;
  questions: number;
  published: boolean;
  importedBy: string | null;
  updatedAt: string;
}

interface PaperRow {
  slug: string;
  title: string;
  skill: "reading" | "listening";
  duration_minutes: number;
  attribution: string | null;
  passage_count: number;
  question_count: number;
  published: boolean;
  imported_by: string | null;
  updated_at: string;
  payload?: unknown;
}

function rowToSummary(r: PaperRow): PaperSummary {
  return {
    slug: r.slug,
    title: r.title,
    skill: r.skill,
    durationMinutes: r.duration_minutes,
    attribution: r.attribution,
    passages: r.passage_count,
    questions: r.question_count,
    published: r.published,
    importedBy: r.imported_by,
    updatedAt: r.updated_at,
  };
}

/** Marks in a paper — a "choose TWO" item counts twice. */
export function countMarks(section: ExamSectionFull): number {
  return section.passages.reduce(
    (n, p) =>
      n +
      p.groups.reduce(
        (m, g) =>
          m +
          g.questions.reduce(
            (k, q) => k + (Array.isArray(q.answer) ? q.answer.length : 1),
            0
          ),
        0
      ),
    0
  );
}

export async function listStoredPapers(
  skill?: "reading" | "listening"
): Promise<PaperSummary[]> {
  const supabase = createAdminClient();
  if (!supabase) return [];
  try {
    let query = supabase
      .from("exam_papers")
      .select(
        "slug, title, skill, duration_minutes, attribution, passage_count, question_count, published, imported_by, updated_at"
      )
      .eq("center_id", CENTER_ID);
    if (skill) query = query.eq("skill", skill);

    const res = await query.order("updated_at", { ascending: false });
    if (res.error || !res.data) return [];
    return (res.data as unknown as PaperRow[]).map(rowToSummary);
  } catch {
    return [];
  }
}

export async function getStoredPaper(
  slug: string
): Promise<ExamSectionFull | null> {
  const supabase = createAdminClient();
  if (!supabase) return null;
  try {
    const res = await supabase
      .from("exam_papers")
      .select("payload, published")
      .eq("center_id", CENTER_ID)
      .eq("slug", slug)
      .maybeSingle();
    const row = res.data as unknown as
      | { payload: ExamSectionFull; published: boolean }
      | null;
    if (res.error || !row?.payload) return null;
    return row.payload;
  } catch {
    return null;
  }
}

/** First published paper for a skill — what the practice route opens by default. */
export async function getFirstStoredPaper(
  skill: "reading" | "listening"
): Promise<ExamSectionFull | null> {
  const supabase = createAdminClient();
  if (!supabase) return null;
  try {
    const res = await supabase
      .from("exam_papers")
      .select("payload")
      .eq("center_id", CENTER_ID)
      .eq("skill", skill)
      .eq("published", true)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    const row = res.data as unknown as { payload: ExamSectionFull } | null;
    if (res.error || !row?.payload) return null;
    return row.payload;
  } catch {
    return null;
  }
}

export interface SavePaperResult {
  ok: boolean;
  error?: string;
  slug?: string;
  replaced?: boolean;
}

/**
 * Insert or replace a paper. The slug is the natural key, so re-importing a
 * corrected file updates in place rather than creating a duplicate.
 */
export async function savePaper(
  section: ExamSectionFull,
  importedBy: string | null
): Promise<SavePaperResult> {
  const supabase = createAdminClient();
  if (!supabase) {
    return { ok: false, error: "База данных не настроена." };
  }

  try {
    const existing = await supabase
      .from("exam_papers")
      .select("slug")
      .eq("center_id", CENTER_ID)
      .eq("slug", section.id)
      .maybeSingle();
    const replaced = !!(existing.data as unknown as { slug: string } | null);

    const { error } = await supabase.from("exam_papers").upsert(
      {
        center_id: CENTER_ID,
        slug: section.id,
        title: section.title,
        skill: section.skill,
        duration_minutes: section.durationMinutes,
        attribution: section.attribution,
        passage_count: section.passages.length,
        question_count: countMarks(section),
        payload: section,
        published: true,
        imported_by: importedBy,
        updated_at: new Date().toISOString(),
      } as never,
      { onConflict: "center_id,slug" }
    );

    if (error) return { ok: false, error: error.message };
    return { ok: true, slug: section.id, replaced };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Не удалось сохранить",
    };
  }
}

export async function deletePaper(slug: string): Promise<{ ok: boolean; error?: string }> {
  const supabase = createAdminClient();
  if (!supabase) return { ok: false, error: "База данных не настроена." };
  const { error } = await supabase
    .from("exam_papers")
    .delete()
    .eq("center_id", CENTER_ID)
    .eq("slug", slug);
  return error ? { ok: false, error: error.message } : { ok: true };
}

export async function setPaperPublished(
  slug: string,
  published: boolean
): Promise<{ ok: boolean; error?: string }> {
  const supabase = createAdminClient();
  if (!supabase) return { ok: false, error: "База данных не настроена." };
  const { error } = await supabase
    .from("exam_papers")
    .update({ published, updated_at: new Date().toISOString() } as never)
    .eq("center_id", CENTER_ID)
    .eq("slug", slug);
  return error ? { ok: false, error: error.message } : { ok: true };
}
