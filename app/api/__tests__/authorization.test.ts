import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * Access-control tests at the ROUTE-HANDLER level, exercised by direct request
 * (not through the UI). The session is mocked so we can play each role; the
 * assertions are about what the handler does with that session — reject the
 * unauthenticated, scope by the server session, and never trust a body-supplied
 * identity.
 */

// --- mocks ------------------------------------------------------------------
const requireSession = vi.fn();
const getStudentsForSession = vi.fn();
const createMockResult = vi.fn();
const saveSubmission = vi.fn();
const loadFullSection = vi.fn();
const gradeSection = vi.fn((..._args: unknown[]) => ({
  band: 7,
  correct: 30,
  total: 40,
  results: [],
  byPassage: [],
}));

vi.mock("@/lib/supabase/auth-server", () => ({
  requireSession: () => requireSession(),
}));
vi.mock("@/lib/data/students", () => ({
  getStudentsForSession: (s: unknown) => getStudentsForSession(s),
  createMockResult: (i: unknown) => createMockResult(i),
}));
vi.mock("@/lib/data/cambridge", () => ({
  saveSubmission: (i: unknown) => saveSubmission(i),
}));
vi.mock("@/lib/exam/service", () => ({
  loadFullSection: (i: unknown) => loadFullSection(i),
  gradeSection: (...a: unknown[]) => gradeSection(...a),
}));

import { GET as studentsGET } from "@/app/api/students/route";
import { POST as mockTestsPOST } from "@/app/api/mock-tests/route";
import { POST as examSubmitPOST } from "@/app/api/exam/submit/route";

const UNAUTH = { error: "Требуется вход.", status: 401 as const };
function session(role: string, studentId: string | null = null) {
  return {
    session: {
      user: { id: `user-${role}`, email: `${role}@x.kz` },
      profile: { id: `user-${role}`, role, full_name: role, student_id: studentId },
    },
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  getStudentsForSession.mockResolvedValue({ students: [], source: "mock" });
  createMockResult.mockResolvedValue({ persisted: true, result: {} });
  saveSubmission.mockResolvedValue(true);
  loadFullSection.mockResolvedValue({ id: "paper-1", skill: "reading", passages: [] });
});

// --- GET /api/students ------------------------------------------------------
describe("GET /api/students", () => {
  it("rejects an unauthenticated request with 401", async () => {
    requireSession.mockResolvedValue(UNAUTH);
    const res = await studentsGET();
    expect(res.status).toBe(401);
    expect(getStudentsForSession).not.toHaveBeenCalled();
  });

  it("scopes by the server session, not by the request", async () => {
    const s = session("student", "s-1");
    requireSession.mockResolvedValue(s);
    await studentsGET();
    // The handler must hand the session (its identity) to the data layer; the
    // data layer is what applies RLS/scoping. No cohort is ever returned raw.
    expect(getStudentsForSession).toHaveBeenCalledWith(s.session);
  });

  it("passes a parent session through so only wards resolve downstream", async () => {
    const s = session("parent", "child-1");
    requireSession.mockResolvedValue(s);
    await studentsGET();
    expect(getStudentsForSession).toHaveBeenCalledWith(s.session);
  });
});

// --- POST /api/mock-tests ---------------------------------------------------
describe("POST /api/mock-tests", () => {
  const body = {
    studentId: "s-9",
    listening: 7,
    reading: 7,
    writing: 6,
    speaking: 6.5,
  };
  const req = () =>
    new Request("http://x/api/mock-tests", {
      method: "POST",
      body: JSON.stringify(body),
    });

  it("rejects the unauthenticated with 401", async () => {
    requireSession.mockResolvedValue(UNAUTH);
    const res = await mockTestsPOST(req());
    expect(res.status).toBe(401);
    expect(createMockResult).not.toHaveBeenCalled();
  });

  it("forbids a student from writing a mock result (403)", async () => {
    requireSession.mockResolvedValue(session("student", "s-1"));
    const res = await mockTestsPOST(req());
    expect(res.status).toBe(403);
    expect(createMockResult).not.toHaveBeenCalled();
  });

  it("forbids a parent from writing a mock result (403)", async () => {
    requireSession.mockResolvedValue(session("parent", "s-1"));
    const res = await mockTestsPOST(req());
    expect(res.status).toBe(403);
  });

  it("allows a teacher to record a result", async () => {
    requireSession.mockResolvedValue(session("teacher"));
    const res = await mockTestsPOST(req());
    expect(res.status).toBe(201);
    expect(createMockResult).toHaveBeenCalled();
  });

  it("maps an RLS rejection (cross-centre student) to 403", async () => {
    requireSession.mockResolvedValue(session("teacher"));
    createMockResult.mockResolvedValue({ persisted: false, error: "rls" });
    const res = await mockTestsPOST(req());
    expect(res.status).toBe(403);
  });
});

// --- POST /api/exam/submit --------------------------------------------------
describe("POST /api/exam/submit", () => {
  const req = (extra: Record<string, unknown> = {}) =>
    new Request("http://x/api/exam/submit", {
      method: "POST",
      body: JSON.stringify({ sectionId: "paper-1", answers: {}, ...extra }),
    });

  it("rejects the unauthenticated with 401", async () => {
    requireSession.mockResolvedValue(UNAUTH);
    const res = await examSubmitPOST(req());
    expect(res.status).toBe(401);
  });

  it("attributes the attempt to the session student, ignoring a body studentId", async () => {
    requireSession.mockResolvedValue(session("student", "real-me"));
    // A malicious client tries to attribute the result to someone else.
    await examSubmitPOST(req({ studentId: "victim" }));
    expect(saveSubmission).toHaveBeenCalledTimes(1);
    const arg = saveSubmission.mock.calls[0][0] as { studentId: string | null };
    expect(arg.studentId).toBe("real-me");
    expect(arg.studentId).not.toBe("victim");
  });

  it("does not attribute a staff preview to any student", async () => {
    requireSession.mockResolvedValue(session("teacher"));
    await examSubmitPOST(req({ studentId: "someone" }));
    const arg = saveSubmission.mock.calls[0][0] as { studentId: string | null };
    expect(arg.studentId).toBeNull();
  });
});
