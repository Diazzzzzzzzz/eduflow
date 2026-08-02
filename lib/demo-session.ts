import type { Role } from "@/lib/auth-routes";

/**
 * Cookie-based demo fallback. When Supabase Auth is unreachable (or
 * unconfigured), the login page can drop a demo-role cookie so the three demo
 * personas remain fully usable without a real session.
 */
export const DEMO_COOKIE = "eduflow_demo_role";
export const DEMO_STUDENT_ID = "33333333-3333-3333-3333-000000000001"; // Арман

/**
 * Demo one-click login is a product-showcase feature and a bypass of real
 * auth, so it stays OFF unless the operator turns it on deliberately.
 *
 * A demo session never reads the centre's database: every screen is served
 * from the bundled fixtures in lib/mock-data, lib/group-data and
 * lib/admin-data. That is what makes it safe to enable on a live deployment —
 * a prospect clicking "Демо" cannot see a real student, and the demo does not
 * depend on the database being populated.
 *
 * Enabled when DEMO_MODE=true (or =1). Unset — the default — is disabled.
 */
export function isDemoEnabled(): boolean {
  const flag = process.env.DEMO_MODE ?? process.env.NEXT_PUBLIC_DEMO_MODE ?? "";
  return flag === "true" || flag === "1";
}

/** Browser-visible mirror, for showing the demo entry on the login page. */
export function isDemoEnabledPublic(): boolean {
  const flag = process.env.NEXT_PUBLIC_DEMO_MODE ?? "";
  return flag === "true" || flag === "1";
}

/** True when this session is the synthetic demo persona, not a real user. */
export function isDemoSession(userId: string | undefined | null): boolean {
  return typeof userId === "string" && userId.startsWith("demo-");
}

const DEMO_NAMES: Record<Role, string> = {
  owner: "Владелец центра (демо)",
  admin: "Директор центра (демо)",
  teacher: "Дана Искакова (демо)",
  student: "Арман Калибеков (демо)",
  parent: "Родитель Армана (демо)",
};

const DEMO_ROLES: Role[] = ["owner", "admin", "teacher", "student", "parent"];

export function isDemoRole(value: string | undefined | null): value is Role {
  return DEMO_ROLES.includes(value as Role);
}

export interface SessionInfo {
  user: { id: string; email: string | null };
  profile: {
    id: string;
    role: Role;
    full_name: string;
    student_id: string | null;
  };
}

/** Synthetic session for a demo role (no real Supabase user). */
export function demoSession(role: Role): SessionInfo {
  return {
    user: { id: `demo-${role}`, email: `${role}@eduflow.kz` },
    profile: {
      id: `demo-${role}`,
      role,
      full_name: DEMO_NAMES[role],
      // Only the student and parent personas are tied to a specific student.
      student_id:
        role === "student" || role === "parent" ? DEMO_STUDENT_ID : null,
    },
  };
}
