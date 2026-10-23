import { defineConfig, mergeConfig } from "vitest/config";
import shared from "../../../../vitest.shared.ts";

export default mergeConfig(
  shared,
  defineConfig({
    test: {
      // The config-dependency suites point process.env at real fake-pnpm and
      // hook-marker paths and mock modules per file, so tests run in order
      // and each file keeps its own module graph (the lab's settings).
      isolate: true,
      sequence: {
        concurrent: false,
      },
    },
  })
);
