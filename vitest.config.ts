import { defineConfig } from "vitest/config";

const isBun = process.versions.bun !== undefined;

export default defineConfig({
  test: {
    projects: [
      "packages/*/vitest.config.ts",
      "packages/*/*/vitest.config.ts",
      "tooling/*/vitest.config.ts",
      "apps/*/vitest.config.ts",
      ...(isBun
        ? [
            // Exclude Node-specific packages when running with Bun
            // Add exclusions here as needed
          ]
        : []),
    ],
  },
});
