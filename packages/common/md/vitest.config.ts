import { defineConfig, mergeConfig } from "vitest/config";
import shared from "../../../vitest.shared.ts";

const reportOnly = process.env.VITEST_COVERAGE_REPORT_ONLY === "1";

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
