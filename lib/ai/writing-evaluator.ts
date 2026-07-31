/**
 * IELTS Writing Task 2 evaluation, backed by the Claude API.
 *
 * The four criterion scores and the feedback come from the model; the overall
 * band is computed here with the official rounding rule rather than asked for,
 * so it can never disagree with the criteria it is derived from.
 *
 * Degrades honestly: with no ANTHROPIC_API_KEY the caller is told the evaluator
 * is unconfigured instead of being handed invented scores.
 *
 * SERVER ONLY — the API key must never reach the browser.
 */
import Anthropic from "@anthropic-ai/sdk";
import type { WritingEvaluation } from "@/lib/types";

export const AI_MODEL = "claude-opus-5";

/** Minimum length worth grading; IELTS Task 2 asks for 250+ words. */
export const MIN_WORDS = 20;

export function isAiConfigured(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

/**
 * Round to the nearest half band, IELTS-style: .25 rounds up to .5 and .75
 * rounds up to the next whole band.
 */
function toHalfBand(value: number): number {
  return Math.round(value * 2) / 2;
}

/** Clamp a model-supplied criterion score into the valid IELTS range. */
function clampBand(value: unknown): number {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return 0;
  return toHalfBand(Math.min(9, Math.max(0, n)));
}

const SYSTEM_PROMPT = `You are an experienced IELTS examiner marking Academic Writing Task 2.

Apply the public band descriptors for the four criteria, each scored 0–9 in half-band steps:
- Task Response — does the answer address all parts of the prompt with a clear, developed position?
- Coherence and Cohesion — logical progression, paragraphing, cohesive devices, referencing.
- Lexical Resource — range, precision, collocation, spelling and word formation.
- Grammatical Range and Accuracy — sentence variety, control, punctuation.

Mark to the same standard as a real examiner: do not inflate scores to be encouraging, and do not deduct for opinions you disagree with. An off-topic answer cannot score above 4 for Task Response. An answer well under 250 words is penalised for Task Response.

Write feedback in Russian, because the students are in Kazakhstan, but quote the learner's own English when pointing at a specific error. Give 3–5 feedback points. Each must be actionable: name the criterion, quote or locate the problem, and state what to do instead. Do not praise generically.`;

/** The shape the model must return. Overall band is derived, not requested. */
const OUTPUT_SCHEMA = {
  type: "object",
  properties: {
    taskAchievement: {
      type: "number",
      description: "Task Response band, 0–9 in 0.5 steps",
    },
    coherence: {
      type: "number",
      description: "Coherence and Cohesion band, 0–9 in 0.5 steps",
    },
    lexical: {
      type: "number",
      description: "Lexical Resource band, 0–9 in 0.5 steps",
    },
    grammar: {
      type: "number",
      description: "Grammatical Range and Accuracy band, 0–9 in 0.5 steps",
    },
    feedback: {
      type: "array",
      items: { type: "string" },
      description:
        "3–5 actionable points in Russian, each naming a criterion and a concrete fix",
    },
  },
  required: ["taskAchievement", "coherence", "lexical", "grammar", "feedback"],
  additionalProperties: false,
} as const;

export type EvaluationOutcome =
  | { ok: true; evaluation: WritingEvaluation }
  | { ok: false; status: number; error: string };

/**
 * Grade an essay. `prompt` is the task question when the centre set one — the
 * examiner cannot judge Task Response properly without it, so it is passed
 * through when available rather than left to inference.
 */
export async function evaluateWriting(
  essay: string,
  prompt?: string
): Promise<EvaluationOutcome> {
  if (!isAiConfigured()) {
    return {
      ok: false,
      status: 503,
      error:
        "AI-проверка не настроена: не задан ANTHROPIC_API_KEY на сервере.",
    };
  }

  const client = new Anthropic();

  try {
    const response = await client.messages.create({
      model: AI_MODEL,
      max_tokens: 8000,
      system: SYSTEM_PROMPT,
      // Thinking is on by default on this model and shares the max_tokens
      // budget with the answer, hence the generous ceiling above.
      output_config: {
        effort: "high",
        format: { type: "json_schema", schema: OUTPUT_SCHEMA },
      },
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: prompt
                ? `Задание (Task 2):\n${prompt}\n\nОтвет студента:\n${essay}`
                : `Ответ студента на IELTS Writing Task 2 (формулировка задания не приложена — оценивайте Task Response по внутренней связности и полноте раскрытия темы):\n\n${essay}`,
            },
          ],
        },
      ],
    });

    // Safety classifiers can decline with a normal 200 — check before reading.
    if (response.stop_reason === "refusal") {
      return {
        ok: false,
        status: 422,
        error: "Модель отказалась оценивать этот текст.",
      };
    }

    const text = response.content.find((b) => b.type === "text");
    if (!text || text.type !== "text") {
      return { ok: false, status: 502, error: "Пустой ответ модели." };
    }

    const raw = JSON.parse(text.text) as Record<string, unknown>;
    const taskAchievement = clampBand(raw.taskAchievement);
    const coherence = clampBand(raw.coherence);
    const lexical = clampBand(raw.lexical);
    const grammar = clampBand(raw.grammar);

    const feedback = Array.isArray(raw.feedback)
      ? raw.feedback.filter((f): f is string => typeof f === "string")
      : [];

    return {
      ok: true,
      evaluation: {
        taskAchievement,
        coherence,
        lexical,
        grammar,
        // Derived, so it always matches the four criteria above.
        overall: toHalfBand(
          (taskAchievement + coherence + lexical + grammar) / 4
        ),
        feedback,
      },
    };
  } catch (err) {
    if (err instanceof Anthropic.RateLimitError) {
      return {
        ok: false,
        status: 429,
        error: "Слишком много запросов к AI. Попробуйте через минуту.",
      };
    }
    if (err instanceof Anthropic.AuthenticationError) {
      return {
        ok: false,
        status: 503,
        error: "Ключ ANTHROPIC_API_KEY отклонён. Проверьте настройки сервера.",
      };
    }
    if (err instanceof Anthropic.APIConnectionError) {
      return {
        ok: false,
        status: 504,
        error: "Не удалось связаться с AI-сервисом.",
      };
    }
    if (err instanceof Anthropic.APIError) {
      console.error("[ai/writing] API error:", err.status, err.message);
      return { ok: false, status: 502, error: "Ошибка AI-сервиса." };
    }
    console.error("[ai/writing] unexpected:", err);
    return { ok: false, status: 500, error: "Не удалось оценить работу." };
  }
}
