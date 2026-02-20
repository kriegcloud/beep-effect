import { coverageConfigDefaults, defaultExclude, defineProject } from "vitest/config";

export default defineProject({
  test: {
    environment: "happy-dom",
    exclude: [...defaultExclude, "**/build/**", "**/test-output/**"],
    setupFiles: ["./vitest.setup.ts"],
    coverage: {
      provider: "v8",
      all: true,
      enabled: true,
      pool: "forks",
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        ...coverageConfigDefaults.exclude,
        "**/*.test.{ts,tsx}",
        "**/__tests__",
        "build",
        "coverage",
        "dist",
        "node_modules",
        "src/index.ts",
        "test-output",
        "vitest.config.*",
      ],
    },
  },
});
