import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * Stage 2 access control: who may change the academic structure.
 *
 * The rule being pinned down: reading is scoped by RLS (any signed-in user may
 * ask, and gets only their own slice), but WRITING is role-gated — enrolment is
 * staff, assigning a teacher and linking a parent to a child are leadership.
 */

const requireSession = vi.fn();
const listGroups = vi.fn();
const listCourses = vi.fn();
const listEnrollments = vi.fn();
const enrollStudent = vi.fn();
const setEnrollmentStatus = vi.fn();
const assignTeacher = vi.fn();
const assignCourse = vi.fn();
const listGuardianships = vi.fn();

vi.mock("@/lib/supabase/auth-server", () => ({
  requireSession: () => requireSession(),
  createRlsClient: () => null,
}));
vi.mock("@/lib/supabase/server", () => ({ createAdminClient: () => null }));
vi.mock("@/lib/data/academic", () => ({
  listGroups: () => listGroups(),
  listCourses: () => listCourses(),
  listEnrollments: (g?: string) => listEnrollments(g),
  enrollStudent: (s: string, g: string) => enrollStudent(s, g),
  setEnrollmentStatus: (e: string, s: string) => setEnrollmentStatus(e, s),
  assignTeacher: (g: string, t: string | null) => assignTeacher(g, t),
  assignCourse: (g: string, c: string | null) => assignCourse(g, c),
  listGuardianships: () => listGuardianships(),
}));

import { GET as groupsGET, PATCH as groupsPATCH } from "@/app/api/academic/groups/route";
import { POST as enrollPOST } from "@/app/api/academic/enrollments/route";
import { POST as guardPOST } from "@/app/api/academic/guardians/route";

const UNAUTH = { error: "Требуется вход.", status: 401 as const };
const session = (role: string) => ({
  session: {
    user: { id: `u-${role}`, email: `${role}@x.kz` },
    profile: { id: `u-${role}`, role, full_name: role, student_id: null },
  },
});

beforeEach(() => {
  vi.clearAllMocks();
  listGroups.mockResolvedValue([]);
  listCourses.mockResolvedValue([]);
  listEnrollments.mockResolvedValue([]);
  enrollStudent.mockResolvedValue({ ok: true });
  assignTeacher.mockResolvedValue({ ok: true });
  assignCourse.mockResolvedValue({ ok: true });
  listGuardianships.mockResolvedValue([]);
});

const json = (url: string, body: unknown, method = "POST") =>
  new Request(url, { method, body: JSON.stringify(body) });

describe("GET /api/academic/groups", () => {
  it("rejects the unauthenticated", async () => {
    requireSession.mockResolvedValue(UNAUTH);
    expect((await groupsGET()).status).toBe(401);
    expect(listGroups).not.toHaveBeenCalled();
  });

  it("lets any signed-in role read (RLS narrows the rows)", async () => {
    for (const role of ["student", "parent", "teacher", "admin"]) {
      requireSession.mockResolvedValue(session(role));
      expect((await groupsGET()).status).toBe(200);
    }
    expect(listGroups).toHaveBeenCalledTimes(4);
  });
});

describe("PATCH /api/academic/groups (assign teacher/course)", () => {
  const req = () => json("http://x/api/academic/groups", { groupId: "g1", teacherId: "t1" }, "PATCH");

  it("rejects the unauthenticated", async () => {
    requireSession.mockResolvedValue(UNAUTH);
    expect((await groupsPATCH(req())).status).toBe(401);
  });

  it("forbids a teacher from reassigning a group (403)", async () => {
    requireSession.mockResolvedValue(session("teacher"));
    expect((await groupsPATCH(req())).status).toBe(403);
    expect(assignTeacher).not.toHaveBeenCalled();
  });

  it("forbids a student and a parent (403)", async () => {
    for (const role of ["student", "parent"]) {
      requireSession.mockResolvedValue(session(role));
      expect((await groupsPATCH(req())).status).toBe(403);
    }
  });

  it("allows leadership", async () => {
    for (const role of ["admin", "owner"]) {
      requireSession.mockResolvedValue(session(role));
      expect((await groupsPATCH(req())).status).toBe(200);
    }
    expect(assignTeacher).toHaveBeenCalledTimes(2);
  });
});

describe("POST /api/academic/enrollments", () => {
  const req = () => json("http://x/api/academic/enrollments", { studentId: "s1", groupId: "g1" });

  it("rejects the unauthenticated", async () => {
    requireSession.mockResolvedValue(UNAUTH);
    expect((await enrollPOST(req())).status).toBe(401);
  });

  it("forbids a student from enrolling anyone (403)", async () => {
    requireSession.mockResolvedValue(session("student"));
    expect((await enrollPOST(req())).status).toBe(403);
    expect(enrollStudent).not.toHaveBeenCalled();
  });

  it("forbids a parent (403)", async () => {
    requireSession.mockResolvedValue(session("parent"));
    expect((await enrollPOST(req())).status).toBe(403);
  });

  it("allows staff", async () => {
    requireSession.mockResolvedValue(session("teacher"));
    expect((await enrollPOST(req())).status).toBe(201);
  });

  it("maps an RLS rejection to 403 (student outside the centre)", async () => {
    requireSession.mockResolvedValue(session("teacher"));
    enrollStudent.mockResolvedValue({ ok: false, error: "rls" });
    expect((await enrollPOST(req())).status).toBe(403);
  });
});

describe("POST /api/academic/guardians (link parent to child)", () => {
  const req = () =>
    json("http://x/api/academic/guardians", {
      parentEmail: "p@x.kz",
      studentId: "s1",
    });

  it("rejects the unauthenticated", async () => {
    requireSession.mockResolvedValue(UNAUTH);
    expect((await guardPOST(req())).status).toBe(401);
  });

  it("forbids a teacher — granting sight of another person's data is leadership-only", async () => {
    requireSession.mockResolvedValue(session("teacher"));
    expect((await guardPOST(req())).status).toBe(403);
  });

  it("forbids a parent from linking themselves to another child (403)", async () => {
    requireSession.mockResolvedValue(session("parent"));
    expect((await guardPOST(req())).status).toBe(403);
  });
});
