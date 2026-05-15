import { defineConfig, mergeConfig } from "vitest/config";
import shared from "../../../../vitest.shared.ts";

const coverageThresholds =
  process.env.VITEST_COVERAGE_REPORT_ONLY === "1"
    ? {}
    : {
        thresholds: {
          branches: 20,
          functions: 40,
          lines: 60,
          statements: 60,
        },
      };

export default mergeConfig(
  shared,
  defineConfig({
    test: {
      coverage: coverageThresholds,
      globals: true,
    },
  })
);
