import { defineConfig, mergeConfig } from "vitest/config";
import shared from "../../vitest.shared.ts";

export default mergeConfig(
  shared,
  defineConfig({
    test: {
      sequence: {
        concurrent: false,
      },
      testTimeout: 300_000,
    },
  })
);
// bench
