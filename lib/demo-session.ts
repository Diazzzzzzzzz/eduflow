import type { Role } from "@/lib/auth-routes";

/**
 * Cookie-based demo fallback. When Supabase Auth is unreachable (or
 * unconfigured), the login page can drop a demo-role cookie so the three demo
 * personas remain fully usable without a real session.
 */
export const DEMO_COOKIE = "eduflow_demo_role";
export const DEMO_STUDENT_ID = "33333333-3333-3333-3333-000000000001"; // Арман

/**
 * Demo one-click login is a product-showcase feature and a bypass of real auth,
 * so it is OFF unless explicitly enabled and NEVER available in production.
 *
 * Enabled only when DEMO_MODE=true (or =1) AND NODE_ENV is not "production".
 * The default — flag unset — is disabled, which is what a real deployment runs.
 */
export function isDemoEnabled(): boolean {
  if (process.env.NODE_ENV === "production") return false;
  const flag = process.env.DEMO_MODE ?? process.env.NEXT_PUBLIC_DEMO_MODE ?? "";
  return flag === "true" || flag === "1";
}

/** Browser-visible mirror, for hiding the demo UI on the login page. */
export function isDemoEnabledPublic(): boolean {
  if (process.env.NODE_ENV === "production") return false;
  const flag = process.env.NEXT_PUBLIC_DEMO_MODE ?? "";
  return flag === "true" || flag === "1";
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
