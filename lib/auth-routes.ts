export type Role = "teacher" | "student" | "parent";

/** The landing route for each role after sign-in. */
export function roleHome(role: string | null | undefined): string {
  switch (role) {
    case "teacher":
      return "/teacher";
    case "parent":
      return "/parent";
    default:
      return "/student";
  }
}

/** Path prefixes that require an authenticated session. */
export const PROTECTED_PREFIXES = ["/teacher", "/groups", "/student", "/parent"];

export function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );
}
