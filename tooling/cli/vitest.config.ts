import path from "node:path";
import { defineConfig, mergeConfig } from "vitest/config";
import shared from "../../vitest.shared.ts";

export default mergeConfig(
  shared,
  defineConfig({
    test: {
      exclude: ["test/fixtures/**"],
      fileParallelism: false,
      globalSetup: [path.join(__dirname, "test/global-cleanup.ts")],
      sequence: {
        concurrent: false,
      },
      testTimeout: 30_000,
    },
  })
);
