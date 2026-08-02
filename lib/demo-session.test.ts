import { describe, it, expect, afterEach, vi } from "vitest";
import { isDemoEnabled } from "./demo-session";

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
