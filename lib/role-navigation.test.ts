import { describe, it, expect } from "vitest";
import { canAccessAdmin, roleHome, type Role } from "./auth-routes";

/**
 * Regression tests for the role/route mix-up: a director opening a group from
 * their dashboard was navigated into the teacher area and left there, which
 * looked like the account had been demoted to teacher.
 *
 * The two rules that prevent it: "up" from a shared page follows the VIEWER's
 * role, and the teacher dashboard itself is not a leadership destination.
 */
describe("role-aware navigation out of the shared group workspace", () => {
  it("sends leadership back to the director dashboard, never to /teacher", () => {
    for (const role of ["owner", "admin"] as Role[]) {
      expect(roleHome(role)).toBe("/admin");
      expect(canAccessAdmin(role)).toBe(true);
    }
  });

  it("sends a teacher back to their own dashboard", () => {
    expect(roleHome("teacher")).toBe("/teacher");
    expect(canAccessAdmin("teacher")).toBe(false);
  });

  it("keeps every other role out of the director dashboard", () => {
    for (const role of ["student", "parent"] as Role[]) {
      expect(canAccessAdmin(role)).toBe(false);
      expect(roleHome(role)).not.toBe("/admin");
    }
  });

  it("treats an absent role as non-leadership", () => {
    expect(canAccessAdmin(undefined)).toBe(false);
    expect(canAccessAdmin(null)).toBe(false);
  });
});

/**
 * Mirrors the `areas` table in middleware.ts. Kept as a pure function here so
 * the rules can be asserted without booting Next's edge runtime; the middleware
 * evaluates the same list in the same order.
 */
const AREAS: Array<{ prefix: string; allowed: string[]; exact?: boolean }> = [
  { prefix: "/admin", allowed: ["owner", "admin"], exact: true },
  { prefix: "/teacher", allowed: ["teacher"], exact: true },
  { prefix: "/teacher", allowed: ["teacher", "owner", "admin"] },
  { prefix: "/student", allowed: ["student"] },
  { prefix: "/parent", allowed: ["parent"] },
];

/** Returns null when allowed, or the dashboard the user is bounced to. */
function guard(path: string, role: string): string | null {
  for (const { prefix, allowed, exact } of AREAS) {
    const matches = exact
      ? path === prefix
      : path === prefix || path.startsWith(`${prefix}/`);
    if (matches && !allowed.includes(role)) return roleHome(role);
  }
  return null;
}

describe("middleware area guards", () => {
  it("lets a director open any group workspace", () => {
    expect(guard("/teacher/groups/IELTS%206.5", "admin")).toBeNull();
    expect(guard("/teacher/groups/IELTS%206.5", "owner")).toBeNull();
  });

  it("lets a director open a student report inside a group", () => {
    expect(guard("/teacher/groups/IELTS%206.5/students/st-01", "admin")).toBeNull();
  });

  it("bounces a director off the teacher dashboard to /admin", () => {
    // The regression: /teacher is written in one teacher's voice, so leadership
    // landing there is what made the role look swapped.
    expect(guard("/teacher", "admin")).toBe("/admin");
    expect(guard("/teacher", "owner")).toBe("/admin");
  });

  it("still lets a teacher use their own dashboard and groups", () => {
    expect(guard("/teacher", "teacher")).toBeNull();
    expect(guard("/teacher/groups/IELTS%206.5", "teacher")).toBeNull();
  });

  it("keeps a teacher out of the director dashboard", () => {
    expect(guard("/admin", "teacher")).toBe("/teacher");
  });

  it("keeps students and parents out of staff areas", () => {
    expect(guard("/teacher/groups/IELTS%206.5", "student")).toBe("/student");
    expect(guard("/admin", "parent")).toBe("/parent");
    expect(guard("/student", "parent")).toBe("/parent");
  });

  it("leaves the teachers' test builder reachable for teachers", () => {
    // /admin is guarded `exact`, so /admin/add-test is not leadership-only.
    expect(guard("/admin/add-test", "teacher")).toBeNull();
  });
});
