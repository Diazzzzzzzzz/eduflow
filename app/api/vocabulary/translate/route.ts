import { NextResponse } from "next/server";
import { getUserProfile } from "@/lib/supabase/auth-server";
import { normalizeTerm, QUICK_GLOSSARY } from "@/lib/vocabulary-data";

export const dynamic = "force-dynamic";

/**
 * POST /api/vocabulary/translate — quick lookup for the selection popover.
 *
 * Backed by a local glossary rather than a third-party service: selected text
 * is a student's study material and doesn't leave the deployment. This is the
 * single place to swap in a real provider — keep the response shape and the
 * popover needs no changes.
 */
export async function POST(request: Request) {
  const session = await getUserProfile();
  if (!session) {
    return NextResponse.json({ error: "Требуется вход." }, { status: 401 });
  }

  let body: { text?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Некорректный запрос" }, { status: 400 });
  }

  const raw = (body.text ?? "").trim();
  if (!raw) {
    return NextResponse.json({ error: "Пустой запрос" }, { status: 422 });
  }
  if (raw.length > 120) {
    return NextResponse.json(
      { error: "Слишком длинный фрагмент — выделите слово или короткую фразу." },
      { status: 422 }
    );
  }

  const term = normalizeTerm(raw);
  const hit = QUICK_GLOSSARY[term];

  if (hit) {
    return NextResponse.json({
      term,
      translation: hit.translation,
      phonetic: hit.phonetic ?? null,
      found: true,
    });
  }

  // Say so plainly instead of inventing a translation — the student can type
  // their own, which is also better for retention.
  return NextResponse.json({
    term,
    translation: null,
    phonetic: null,
    found: false,
    message: "Перевода нет в словаре — введите свой вариант.",
  });
}
