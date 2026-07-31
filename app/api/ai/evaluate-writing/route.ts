import { NextResponse } from "next/server";
import { requireSession } from "@/lib/supabase/auth-server";
import { evaluateWriting, MIN_WORDS } from "@/lib/ai/writing-evaluator";

export const dynamic = "force-dynamic";

/**
 * POST /api/ai/evaluate-writing — mark an IELTS Task 2 essay.
 *
 * Authenticated only: this is a paid model call, so it must not be reachable
 * anonymously. Until now it returned fixed bands regardless of the essay; it
 * now calls Claude and reports honestly when the evaluator is unconfigured
 * rather than inventing a score.
 */
export async function POST(request: Request) {
  const gate = await requireSession();
  if ("error" in gate) {
    return NextResponse.json({ error: gate.error }, { status: gate.status });
  }

  let body: { essay?: string; prompt?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Некорректный запрос" }, { status: 400 });
  }

  const essay = body.essay?.trim() ?? "";
  if (!essay || essay.split(/\s+/).length < MIN_WORDS) {
    return NextResponse.json(
      { error: `Нужен текст не короче ${MIN_WORDS} слов.` },
      { status: 400 }
    );
  }

  const result = await evaluateWriting(essay, body.prompt);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  return NextResponse.json({ evaluation: result.evaluation });
}
