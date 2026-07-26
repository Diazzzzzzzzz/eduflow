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

/** The landing route for each role after sign-in. */
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
