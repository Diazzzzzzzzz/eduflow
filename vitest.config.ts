import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

/**
 * Test runner for the authorization suite. Node environment (these are
 * server-side access-control tests, no DOM), with the same `@/` alias the app
 * uses so imports resolve identically.
 */
export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    include: ["**/*.test.ts"],
    exclude: ["node_modules/**", ".next/**"],
  },
});
