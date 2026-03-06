import { defineConfig, mergeConfig } from "vitest/config";
import shared from "../../../vitest.shared.ts";

export default mergeConfig(
  shared,
  defineConfig({
    test: {
      fileParallelism: false,
      globals: true,
      sequence: {
        concurrent: false,
      },
    },
  })
);
