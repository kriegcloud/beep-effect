import { defineConfig, mergeConfig } from "vitest/config";
import shared, { vitestCoverageReportOnly } from "../../../../vitest.shared.ts";

const reportOnly = vitestCoverageReportOnly;

export default mergeConfig(
  shared,
  defineConfig({
    test: {
      coverage: {
        thresholds: reportOnly
          ? {
              branches: 0,
              functions: 0,
              lines: 0,
              statements: 0,
            }
          : {
              branches: 100,
              functions: 100,
              lines: 100,
              statements: 100,
            },
      },
    },
  })
);
