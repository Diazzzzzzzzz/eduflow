import { describe, it, expect, vi, afterEach } from "vitest";
import { isAiConfigured } from "./writing-evaluator";

/**
 * The evaluator must fail closed: with no key it reports that it is
 * unconfigured, so the route can say so instead of returning a made-up band.
 */
describe("isAiConfigured", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("is false when no key is set", () => {
    vi.stubEnv("ANTHROPIC_API_KEY", "");
    expect(isAiConfigured()).toBe(false);
  });

  it("is true once a key is present", () => {
    vi.stubEnv("ANTHROPIC_API_KEY", "sk-ant-test");
    expect(isAiConfigured()).toBe(true);
  });
});
