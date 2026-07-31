import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * /api/groups: scope comes from the session. A teacher must not receive the
 * groups they do not run — the dashboard used to render every seeded group,
 * including foreign ones shown with "0 students".
 */

const requireSession = vi.fn();
const getGroupsForSession = vi.fn();

vi.mock("@/lib/supabase/auth-server", () => ({
  requireSession: () => requireSession(),
}));
vi.mock("@/lib/data/groups", () => ({
  getGroupsForSession: (s: unknown) => getGroupsForSession(s),
}));

import { GET as groupsGET } from "@/app/api/groups/route";

const UNAUTH = { error: "Требуется вход.", status: 401 as const };
const session = (role: string) => ({
  session: {
    user: { id: `u-${role}`, email: `${role}@x.kz` },
    profile: { id: `u-${role}`, role, full_name: role, student_id: null },
  },
});

beforeEach(() => {
  vi.clearAllMocks();
  getGroupsForSession.mockResolvedValue([]);
});

describe("GET /api/groups", () => {
  it("rejects the unauthenticated", async () => {
    requireSession.mockResolvedValue(UNAUTH);
    const res = await groupsGET();
    expect(res.status).toBe(401);
    expect(getGroupsForSession).not.toHaveBeenCalled();
  });

  it("passes the session down so scoping happens server-side", async () => {
    const s = session("teacher");
    requireSession.mockResolvedValue(s);
    const res = await groupsGET();
    expect(res.status).toBe(200);
    expect(getGroupsForSession).toHaveBeenCalledWith(s.session);
  });

  it("returns whatever the scoped loader gives, unmodified", async () => {
    requireSession.mockResolvedValue(session("teacher"));
    getGroupsForSession.mockResolvedValue([
      { id: "g1", name: "IELTS 62", schedule: "Вт, Чт" },
    ]);
    const res = await groupsGET();
    const body = (await res.json()) as { groups: { name: string }[] };
    expect(body.groups).toHaveLength(1);
    expect(body.groups[0].name).toBe("IELTS 62");
  });
});
