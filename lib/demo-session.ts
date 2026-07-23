import type { Role } from "@/lib/auth-routes";

/**
 * Cookie-based demo fallback. When Supabase Auth is unreachable (or
 * unconfigured), the login page can drop a demo-role cookie so the three demo
 * personas remain fully usable without a real session.
 */
export const DEMO_COOKIE = "eduflow_demo_role";
export const DEMO_STUDENT_ID = "33333333-3333-3333-3333-000000000001"; // Арман

const DEMO_NAMES: Record<Role, string> = {
  teacher: "Дана Искакова (демо)",
  student: "Арман Калибеков (демо)",
  parent: "Родитель Армана (демо)",
};

export function isDemoRole(value: string | undefined | null): value is Role {
  return value === "teacher" || value === "student" || value === "parent";
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
      student_id: role === "teacher" ? null : DEMO_STUDENT_ID,
    },
  };
}
