import { defineConfig, mergeConfig } from "vitest/config";
import shared from "../../../vitest.shared.ts";

const coverageThresholds =
  process.env.VITEST_COVERAGE_REPORT_ONLY === "1"
    ? {}
    : {
        thresholds: {
          branches: 100,
          functions: 100,
          lines: 100,
          statements: 100,
        },
      };

export default mergeConfig(
  shared,
  defineConfig({
    test: {
      coverage: {
        include: [
          "src/entities/**/*.ts",
          "src/entity/*.ts",
          "src/identity/*.ts",
          "src/values/LocalDate/*.ts",
          "src/values/OnePasswordReference/*.ts",
        ],
        ...coverageThresholds,
      },
    },
  })
);
