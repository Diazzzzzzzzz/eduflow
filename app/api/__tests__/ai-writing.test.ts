import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * The AI evaluation route: a paid model call, so it must be authenticated,
 * must validate input before spending a request, and must surface a failure
 * rather than substituting a score.
 */

const requireSession = vi.fn();
const evaluateWriting = vi.fn();

vi.mock("@/lib/supabase/auth-server", () => ({
  requireSession: () => requireSession(),
}));
vi.mock("@/lib/ai/writing-evaluator", () => ({
  evaluateWriting: (essay: string, prompt?: string) =>
    evaluateWriting(essay, prompt),
  MIN_WORDS: 20,
}));

import { POST } from "@/app/api/ai/evaluate-writing/route";

const UNAUTH = { error: "Требуется вход.", status: 401 as const };
const session = (role: string) => ({
  session: {
    user: { id: `u-${role}`, email: `${role}@x.kz` },
    profile: { id: `u-${role}`, role, full_name: role, student_id: null },
  },
});
const essay = "word ".repeat(60).trim();
const post = (body: unknown) =>
  new Request("http://x/api/ai/evaluate-writing", {
    method: "POST",
    body: JSON.stringify(body),
  });

beforeEach(() => {
  vi.clearAllMocks();
  evaluateWriting.mockResolvedValue({
    ok: true,
    evaluation: {
      taskAchievement: 6,
      coherence: 6.5,
      lexical: 6,
      grammar: 5.5,
      overall: 6,
      feedback: ["…"],
    },
  });
});

describe("POST /api/ai/evaluate-writing", () => {
  it("rejects the unauthenticated without calling the model", async () => {
    requireSession.mockResolvedValue(UNAUTH);
    const res = await POST(post({ essay }));
    expect(res.status).toBe(401);
    expect(evaluateWriting).not.toHaveBeenCalled();
  });

  it("rejects a too-short essay before spending a request", async () => {
    requireSession.mockResolvedValue(session("teacher"));
    const res = await POST(post({ essay: "too short" }));
    expect(res.status).toBe(400);
    expect(evaluateWriting).not.toHaveBeenCalled();
  });

  it("grades for an authenticated caller", async () => {
    requireSession.mockResolvedValue(session("teacher"));
    const res = await POST(post({ essay }));
    expect(res.status).toBe(200);
    const body = (await res.json()) as { evaluation: { overall: number } };
    expect(body.evaluation.overall).toBe(6);
  });

  it("passes the task prompt through when one is supplied", async () => {
    requireSession.mockResolvedValue(session("teacher"));
    await POST(post({ essay, prompt: "Some people believe…" }));
    expect(evaluateWriting).toHaveBeenCalledWith(essay, "Some people believe…");
  });

  it("surfaces an unconfigured evaluator instead of inventing a score", async () => {
    requireSession.mockResolvedValue(session("teacher"));
    evaluateWriting.mockResolvedValue({
      ok: false,
      status: 503,
      error: "AI-проверка не настроена: не задан ANTHROPIC_API_KEY на сервере.",
    });
    const res = await POST(post({ essay }));
    expect(res.status).toBe(503);
    const body = (await res.json()) as { evaluation?: unknown; error: string };
    expect(body.evaluation).toBeUndefined();
    expect(body.error).toMatch(/ANTHROPIC_API_KEY/);
  });

  it("propagates a rate-limit refusal as 429", async () => {
    requireSession.mockResolvedValue(session("teacher"));
    evaluateWriting.mockResolvedValue({
      ok: false,
      status: 429,
      error: "Слишком много запросов к AI.",
    });
    expect((await POST(post({ essay }))).status).toBe(429);
  });
});
