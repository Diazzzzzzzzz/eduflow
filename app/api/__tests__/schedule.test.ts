import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * /api/schedule: reading the timetable is RLS-scoped and open to any signed-in
 * role; planning a lesson is staff-only.
 */

const requireSession = vi.fn();
const listClassSessions = vi.fn();
const scheduleClassSession = vi.fn();

vi.mock("@/lib/supabase/auth-server", () => ({
  requireSession: () => requireSession(),
}));
vi.mock("@/lib/data/schedule", () => ({
  listClassSessions: (g?: string) => listClassSessions(g),
  scheduleClassSession: (i: unknown) => scheduleClassSession(i),
}));

import { GET, POST } from "@/app/api/schedule/route";

const UNAUTH = { error: "Требуется вход.", status: 401 as const };
const session = (role: string) => ({
  session: {
    user: { id: `u-${role}`, email: `${role}@x.kz` },
    profile: { id: `u-${role}`, role, full_name: role, student_id: null },
  },
});
const body = { groupName: "IELTS 62", date: "2026-08-10", topic: "Task 2" };
const post = (b: unknown) =>
  new Request("http://x/api/schedule", { method: "POST", body: JSON.stringify(b) });

beforeEach(() => {
  vi.clearAllMocks();
  listClassSessions.mockResolvedValue([]);
  scheduleClassSession.mockResolvedValue({ ok: true, id: "cs1" });
});

describe("GET /api/schedule", () => {
  it("rejects the unauthenticated", async () => {
    requireSession.mockResolvedValue(UNAUTH);
    expect((await GET(new Request("http://x/api/schedule"))).status).toBe(401);
    expect(listClassSessions).not.toHaveBeenCalled();
  });

  it("lets any signed-in role read; RLS narrows the rows", async () => {
    for (const role of ["student", "parent", "teacher", "admin"]) {
      requireSession.mockResolvedValue(session(role));
      expect((await GET(new Request("http://x/api/schedule"))).status).toBe(200);
    }
  });
});

describe("POST /api/schedule", () => {
  it("rejects the unauthenticated", async () => {
    requireSession.mockResolvedValue(UNAUTH);
    expect((await POST(post(body))).status).toBe(401);
  });

  it("forbids a student from scheduling a lesson", async () => {
    requireSession.mockResolvedValue(session("student"));
    expect((await POST(post(body))).status).toBe(403);
    expect(scheduleClassSession).not.toHaveBeenCalled();
  });

  it("forbids a parent", async () => {
    requireSession.mockResolvedValue(session("parent"));
    expect((await POST(post(body))).status).toBe(403);
  });

  it("allows staff", async () => {
    requireSession.mockResolvedValue(session("teacher"));
    expect((await POST(post(body))).status).toBe(201);
    expect(scheduleClassSession).toHaveBeenCalledWith(
      expect.objectContaining({ groupName: "IELTS 62", date: "2026-08-10" })
    );
  });

  it("rejects a malformed date (422)", async () => {
    requireSession.mockResolvedValue(session("teacher"));
    expect((await POST(post({ ...body, date: "10.08.2026" }))).status).toBe(422);
    expect(scheduleClassSession).not.toHaveBeenCalled();
  });

  it("maps an RLS refusal to 403", async () => {
    requireSession.mockResolvedValue(session("teacher"));
    scheduleClassSession.mockResolvedValue({ ok: false, error: "rls" });
    expect((await POST(post(body))).status).toBe(403);
  });
});
