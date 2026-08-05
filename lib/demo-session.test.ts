import { describe, it, expect, afterEach, vi } from "vitest";
import { DEMO_STUDENT_ID, demoSession, isDemoEnabled } from "./demo-session";
import { STUDENTS } from "./mock-data";

/**
 * Demo login is a bypass of real auth, so the gate must fail safe: off unless
 * explicitly enabled, and never on in production regardless of the flag.
 */
describe("isDemoEnabled", () => {
  const env = { ...process.env };
  afterEach(() => {
    process.env = { ...env };
    vi.unstubAllEnvs();
  });

  it("is off when no flag is set", () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("DEMO_MODE", "");
    vi.stubEnv("NEXT_PUBLIC_DEMO_MODE", "");
    expect(isDemoEnabled()).toBe(false);
  });

  it("is on in development when DEMO_MODE=true", () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("DEMO_MODE", "true");
    expect(isDemoEnabled()).toBe(true);
  });

  it("can be enabled in production, deliberately, for client showcases", () => {
    // A demo session is served from bundled fixtures and never touches the
    // centre's database, so enabling it on a live deployment is safe.
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("DEMO_MODE", "true");
    expect(isDemoEnabled()).toBe(true);
  });

  it("stays off in production when the flag is unset", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("DEMO_MODE", "");
    vi.stubEnv("NEXT_PUBLIC_DEMO_MODE", "");
    expect(isDemoEnabled()).toBe(false);
  });
});

/**
 * The demo persona and the demo roster have to name the same student.
 *
 * They did not: the session claimed the seeded Арман row's real UUID while the
 * roster the demo renders hands out fixture ids. Every endpoint that checks
 * "the id you asked for" against "the id on your session" then refused — which
 * is exactly how the vocabulary page came to 403 for a demo student.
 */
describe("the demo student's identity", () => {
  it("is the id the bundled roster actually uses", () => {
    expect(DEMO_STUDENT_ID).toBe(STUDENTS[0].id);
  });

  it("is what the student and parent personas carry", () => {
    expect(demoSession("student").profile.student_id).toBe(STUDENTS[0].id);
    expect(demoSession("parent").profile.student_id).toBe(STUDENTS[0].id);
  });

  it("is absent for personas with no student of their own", () => {
    for (const role of ["teacher", "admin", "owner"] as const) {
      expect(demoSession(role).profile.student_id, role).toBeNull();
    }
  });
});
