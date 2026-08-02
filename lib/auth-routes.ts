export type Role = "owner" | "admin" | "teacher" | "student" | "parent";

/** Roles allowed into the director dashboard at /admin. */
export const ADMIN_ROLES: Role[] = ["owner", "admin"];

/** School leadership: sees the whole centre rather than one group. */
export function canAccessAdmin(role: string | null | undefined): boolean {
  return ADMIN_ROLES.includes(role as Role);
}

/** Anyone who can author and grade — everything except students and parents. */
export function isStaff(role: string | null | undefined): boolean {
  return role === "owner" || role === "admin" || role === "teacher";
}

/**
 * Roles a visitor may pick for themselves on the sign-up form.
 *
 * Deliberately excludes owner/admin: leadership is granted from the director
 * dashboard, never claimed. The OAuth callback checks against this before
 * honouring a role carried in the redirect URL.
 */
export const SELF_ASSIGNABLE_ROLES: Role[] = ["student", "teacher", "parent"];

export function isSelfAssignableRole(role: string | null | undefined): role is Role {
  return SELF_ASSIGNABLE_ROLES.includes(role as Role);
}

/** Human-readable role names, shared by every surface that displays one. */
export const ROLE_LABEL: Record<Role, string> = {
  owner: "Владелец",
  admin: "Директор",
  teacher: "Учитель",
  student: "Студент",
  parent: "Родитель",
};

/**
 * The dashboard a role calls home. Also the "up" target for nested pages, so a
 * director browsing a group returns to /admin rather than the teacher area.
 */
export function roleHome(role: string | null | undefined): string {
  switch (role) {
    case "owner":
    case "admin":
      return "/admin";
    case "teacher":
      return "/teacher";
    case "parent":
      return "/parent";
    default:
      return "/student";
  }
}

/** Path prefixes that require an authenticated session. */
export const PROTECTED_PREFIXES = ["/admin", "/teacher", "/student", "/parent"];

export function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );
}
