import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * Stage 3b access control: attendance.
 *
 * Reading is RLS-scoped (any signed-in role may ask and gets only their
 * slice); marking is staff-only, with the group resolved server-side from the
 * student's enrollment — never named by the client.
 */

const requireSession = vi.fn();
const listAttendance = vi.fn();
const markAttendance = vi.fn();

vi.mock("@/lib/supabase/auth-server", () => ({
  requireSession: () => requireSession(),
}));
vi.mock("@/lib/data/attendance", () => ({
  listAttendance: (o?: unknown) => listAttendance(o),
  markAttendance: (...a: unknown[]) => markAttendance(...a),
}));

import { GET as attGET, POST as attPOST } from "@/app/api/attendance/route";

const UNAUTH = { error: "Требуется вход.", status: 401 as const };
const session = (role: string, studentId: string | null = null) => ({
  session: {
    user: { id: `u-${role}`, email: `${role}@x.kz` },
    profile: { id: `u-${role}`, role, full_name: role, student_id: studentId },
  },
});
const post = (body: unknown) =>
  new Request("http://x/api/attendance", {
    method: "POST",
    body: JSON.stringify(body),
  });

beforeEach(() => {
  vi.clearAllMocks();
  listAttendance.mockResolvedValue([]);
  markAttendance.mockResolvedValue({ ok: true });
});

describe("GET /api/attendance", () => {
  it("rejects the unauthenticated", async () => {
    requireSession.mockResolvedValue(UNAUTH);
    const res = await attGET(new Request("http://x/api/attendance"));
    expect(res.status).toBe(401);
    expect(listAttendance).not.toHaveBeenCalled();
  });

  it("lets any signed-in role read; RLS narrows the rows", async () => {
    for (const role of ["student", "parent", "teacher", "admin"]) {
      requireSession.mockResolvedValue(session(role));
      const res = await attGET(new Request("http://x/api/attendance"));
      expect(res.status).toBe(200);
    }
  });
});

describe("POST /api/attendance (mark)", () => {
  const body = { studentId: "s1", date: "2026-07-31", status: "present" };

  it("rejects the unauthenticated", async () => {
    requireSession.mockResolvedValue(UNAUTH);
    expect((await attPOST(post(body))).status).toBe(401);
  });

  it("forbids a student from marking themselves present (403)", async () => {
    requireSession.mockResolvedValue(session("student", "s1"));
    expect((await attPOST(post(body))).status).toBe(403);
    expect(markAttendance).not.toHaveBeenCalled();
  });

  it("forbids a parent (403)", async () => {
    requireSession.mockResolvedValue(session("parent"));
    expect((await attPOST(post(body))).status).toBe(403);
  });

  it("allows staff and records who marked it", async () => {
    requireSession.mockResolvedValue(session("teacher"));
    expect((await attPOST(post(body))).status).toBe(201);
    expect(markAttendance).toHaveBeenCalledWith(
      "s1",
      "2026-07-31",
      "present",
      "u-teacher"
    );
  });

  it("rejects a malformed date or status (422)", async () => {
    requireSession.mockResolvedValue(session("teacher"));
    for (const bad of [
      { ...body, date: "31.07.2026" },
      { ...body, status: "sick" },
      { studentId: "s1", date: "2026-07-31" },
    ]) {
      expect((await attPOST(post(bad))).status).toBe(422);
    }
    expect(markAttendance).not.toHaveBeenCalled();
  });

  it("maps an RLS refusal (foreign student) to 403", async () => {
    requireSession.mockResolvedValue(session("teacher"));
    markAttendance.mockResolvedValue({ ok: false, error: "rls" });
    expect((await attPOST(post(body))).status).toBe(403);
  });
});
