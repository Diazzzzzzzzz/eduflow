import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * Stage 3a access control: the homework lifecycle.
 *
 * The rules pinned here: reading is RLS-scoped (anyone signed in may ask),
 * assigning and marking are staff-only, and handing work in is attributed to
 * the session — a studentId in the body is never an argument for access.
 */

const requireSession = vi.fn();
const getHomeworkBoard = vi.fn();
const createHomework = vi.fn();
const submitHomework = vi.fn();
const gradeSubmission = vi.fn();

vi.mock("@/lib/supabase/auth-server", () => ({
  requireSession: () => requireSession(),
}));
vi.mock("@/lib/data/homework", () => ({
  getHomeworkBoard: (g?: string) => getHomeworkBoard(g),
  createHomework: (i: unknown, by: string) => createHomework(i, by),
  submitHomework: (h: string, s: string, c: string) => submitHomework(h, s, c),
  gradeSubmission: (...a: unknown[]) => gradeSubmission(...a),
}));

import { GET as hwGET, POST as hwPOST } from "@/app/api/homework/route";
import {
  POST as subPOST,
  PATCH as subPATCH,
} from "@/app/api/homework/submissions/route";

const UNAUTH = { error: "Требуется вход.", status: 401 as const };
const session = (role: string, studentId: string | null = null) => ({
  session: {
    user: { id: `u-${role}`, email: `${role}@x.kz` },
    profile: { id: `u-${role}`, role, full_name: role, student_id: studentId },
  },
});
const json = (body: unknown, method = "POST") =>
  new Request("http://x/api/homework", { method, body: JSON.stringify(body) });

beforeEach(() => {
  vi.clearAllMocks();
  getHomeworkBoard.mockResolvedValue({ homework: [], submissions: [] });
  createHomework.mockResolvedValue({ ok: true, homeworkId: "hw1" });
  submitHomework.mockResolvedValue({ ok: true });
  gradeSubmission.mockResolvedValue({ ok: true });
});

describe("GET /api/homework", () => {
  it("rejects the unauthenticated", async () => {
    requireSession.mockResolvedValue(UNAUTH);
    const res = await hwGET(new Request("http://x/api/homework"));
    expect(res.status).toBe(401);
    expect(getHomeworkBoard).not.toHaveBeenCalled();
  });

  it("lets any signed-in role read; RLS narrows the rows", async () => {
    for (const role of ["student", "parent", "teacher", "owner"]) {
      requireSession.mockResolvedValue(session(role));
      const res = await hwGET(new Request("http://x/api/homework"));
      expect(res.status).toBe(200);
    }
  });
});

describe("POST /api/homework (assign work)", () => {
  const body = { groupName: "IELTS 62", title: "Essay" };

  it("rejects the unauthenticated", async () => {
    requireSession.mockResolvedValue(UNAUTH);
    expect((await hwPOST(json(body))).status).toBe(401);
  });

  it("forbids a student from assigning homework", async () => {
    requireSession.mockResolvedValue(session("student", "s1"));
    expect((await hwPOST(json(body))).status).toBe(403);
    expect(createHomework).not.toHaveBeenCalled();
  });

  it("forbids a parent", async () => {
    requireSession.mockResolvedValue(session("parent"));
    expect((await hwPOST(json(body))).status).toBe(403);
  });

  it("allows a teacher, and records who set it", async () => {
    requireSession.mockResolvedValue(session("teacher"));
    expect((await hwPOST(json(body))).status).toBe(201);
    expect(createHomework).toHaveBeenCalledWith(
      expect.objectContaining({ groupName: "IELTS 62", title: "Essay" }),
      "u-teacher"
    );
  });

  it("rejects a task with no title (422)", async () => {
    requireSession.mockResolvedValue(session("teacher"));
    expect((await hwPOST(json({ groupName: "IELTS 62" }))).status).toBe(422);
  });
});

describe("POST /api/homework/submissions (hand in)", () => {
  const body = { homeworkId: "hw1", content: "my essay" };

  it("rejects the unauthenticated", async () => {
    requireSession.mockResolvedValue(UNAUTH);
    expect((await subPOST(json(body))).status).toBe(401);
  });

  it("attributes the work to the session, ignoring a body studentId", async () => {
    requireSession.mockResolvedValue(session("student", "real-me"));
    await subPOST(json({ ...body, studentId: "victim" }));
    expect(submitHomework).toHaveBeenCalledWith("hw1", "real-me", "my essay");
  });

  it("forbids a teacher from submitting on a student's behalf", async () => {
    requireSession.mockResolvedValue(session("teacher"));
    expect((await subPOST(json(body))).status).toBe(403);
    expect(submitHomework).not.toHaveBeenCalled();
  });

  it("forbids a parent from submitting for their child", async () => {
    requireSession.mockResolvedValue(session("parent"));
    expect((await subPOST(json(body))).status).toBe(403);
  });

  it("maps 'not assigned to you' to 403", async () => {
    requireSession.mockResolvedValue(session("student", "s1"));
    submitHomework.mockResolvedValue({ ok: false, error: "Это задание вам не назначено." });
    expect((await subPOST(json(body))).status).toBe(403);
  });
});

describe("PATCH /api/homework/submissions (mark)", () => {
  const body = { submissionId: "sub1", band: 6.5, feedback: "ok" };

  it("rejects the unauthenticated", async () => {
    requireSession.mockResolvedValue(UNAUTH);
    expect((await subPATCH(json(body, "PATCH"))).status).toBe(401);
  });

  it("forbids a student from marking their own work", async () => {
    requireSession.mockResolvedValue(session("student", "s1"));
    expect((await subPATCH(json(body, "PATCH"))).status).toBe(403);
    expect(gradeSubmission).not.toHaveBeenCalled();
  });

  it("forbids a parent", async () => {
    requireSession.mockResolvedValue(session("parent"));
    expect((await subPATCH(json(body, "PATCH"))).status).toBe(403);
  });

  it("allows staff and records the marker", async () => {
    requireSession.mockResolvedValue(session("teacher"));
    expect((await subPATCH(json(body, "PATCH"))).status).toBe(200);
    expect(gradeSubmission).toHaveBeenCalledWith(
      "sub1",
      6.5,
      "ok",
      null,
      "u-teacher"
    );
  });

  it("rejects a band off the half-point scale (422)", async () => {
    requireSession.mockResolvedValue(session("teacher"));
    for (const band of [7.3, -1, 9.5]) {
      const res = await subPATCH(json({ ...body, band }, "PATCH"));
      expect(res.status).toBe(422);
    }
    expect(gradeSubmission).not.toHaveBeenCalled();
  });
});
