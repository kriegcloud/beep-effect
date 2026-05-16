import { defineConfig, mergeConfig } from "vitest/config";
import shared, { vitestCoverageReportOnly } from "../../../../vitest.shared.ts";

const coverageThresholds = vitestCoverageReportOnly
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
