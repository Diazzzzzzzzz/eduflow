import { NextResponse } from "next/server";
import type { WritingEvaluation } from "@/lib/types";

/**
 * POST /api/ai/evaluate-writing — demo evaluator.
 * Returns fixed criterion bands after a simulated model delay; replace the
 * body of this handler with a real Claude API call when AI scoring ships.
 */
export async function POST(request: Request) {
  const { essay } = (await request.json()) as { essay?: string };

  if (!essay || essay.trim().split(/\s+/).length < 20) {
    return NextResponse.json(
      { error: "Provide an essay of at least 20 words" },
      { status: 400 }
    );
  }

  await new Promise((resolve) => setTimeout(resolve, 1500));

  const evaluation: WritingEvaluation = {
    taskAchievement: 6.5,
    coherence: 6.0,
    lexical: 7.0,
    grammar: 6.5,
    overall: 6.5,
    feedback: [
      "Position is clear, but body paragraph 2 drifts from the thesis — restate the main argument in the topic sentence.",
      "Cohesive devices are repetitive ('moreover' ×4). Vary with referencing: 'this measure', 'such an approach'.",
      "Good lexical range ('detrimental', 'inevitably'); watch article accuracy — 'the society' → 'society'.",
    ],
  };

  return NextResponse.json({ evaluation });
}
