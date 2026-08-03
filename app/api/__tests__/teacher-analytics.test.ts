import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * Access control for GET /api/admin/teachers/[id].
 *
 * A teacher's cohort figures — their students' bands, attendance and marking
 * backlog — are leadership's view of a colleague's performance. The page guard
 * only stops navigation, so the endpoint is tested directly here.
 */
const getUserProfile = vi.fn();
const getTeacherAnalytics = vi.fn();
const demoTeacherAnalytics = vi.fn();

vi.mock("@/lib/supabase/auth-server", () => ({
  getUserProfile: () => getUserProfile(),
}));
vi.mock("@/lib/data/teacher-analytics", () => ({
  getTeacherAnalytics: (id: string) => getTeacherAnalytics(id),
  demoTeacherAnalytics: (id: string) => demoTeacherAnalytics(id),
}));

import { GET } from "@/app/api/admin/teachers/[id]/route";

const ANALYTICS = { teacher: { id: "t-1", name: "Дана" }, students: [] };

function session(role: string, userId = `user-${role}`) {
  return {
    user: { id: userId, email: `${role}@x.kz` },
    profile: { id: userId, role, full_name: role, student_id: null },
  };
}

const req = () => new Request("http://x/api/admin/teachers/t-1");
const ctx = { params: { id: "t-1" } };

beforeEach(() => {
  vi.clearAllMocks();
  getTeacherAnalytics.mockResolvedValue(ANALYTICS);
  demoTeacherAnalytics.mockReturnValue(ANALYTICS);
});

describe("GET /api/admin/teachers/[id]", () => {
  it("rejects the unauthenticated with 401", async () => {
    getUserProfile.mockResolvedValue(null);
    const res = await GET(req(), ctx);
    expect(res.status).toBe(401);
    expect(getTeacherAnalytics).not.toHaveBeenCalled();
  });

  it("forbids a teacher from reading a colleague's analytics (403)", async () => {
    getUserProfile.mockResolvedValue(session("teacher"));
    const res = await GET(req(), ctx);
    expect(res.status).toBe(403);
    expect(getTeacherAnalytics).not.toHaveBeenCalled();
  });

  it("forbids students and parents (403)", async () => {
    for (const role of ["student", "parent"]) {
      getUserProfile.mockResolvedValue(session(role));
      const res = await GET(req(), ctx);
      expect(res.status, role).toBe(403);
    }
    expect(getTeacherAnalytics).not.toHaveBeenCalled();
  });

  it("allows leadership", async () => {
    for (const role of ["owner", "admin"]) {
      vi.clearAllMocks();
      getTeacherAnalytics.mockResolvedValue(ANALYTICS);
      getUserProfile.mockResolvedValue(session(role));
      const res = await GET(req(), ctx);
      expect(res.status, role).toBe(200);
      expect(getTeacherAnalytics).toHaveBeenCalledWith("t-1");
    }
  });

  it("404s an unknown teacher instead of rendering an empty panel", async () => {
    getUserProfile.mockResolvedValue(session("admin"));
    getTeacherAnalytics.mockResolvedValue(null);
    const res = await GET(req(), ctx);
    expect(res.status).toBe(404);
  });

  it("serves a demo session from fixtures, never the centre's database", async () => {
    getUserProfile.mockResolvedValue(session("admin", "demo-admin"));
    const res = await GET(req(), ctx);
    expect(res.status).toBe(200);
    expect(demoTeacherAnalytics).toHaveBeenCalledWith("t-1");
    expect(getTeacherAnalytics).not.toHaveBeenCalled();
  });

  it("still 404s a demo session for a teacher the fixtures don't know", async () => {
    getUserProfile.mockResolvedValue(session("admin", "demo-admin"));
    demoTeacherAnalytics.mockReturnValue(null);
    const res = await GET(req(), ctx);
    expect(res.status).toBe(404);
  });
});
