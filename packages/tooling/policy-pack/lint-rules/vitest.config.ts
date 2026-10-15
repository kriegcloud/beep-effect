import { defineConfig, mergeConfig } from "vitest/config";
import shared, { fcDeepSweepActive, vitestCoverageRunActive } from "../../../../vitest.shared.ts";

export default mergeConfig(
  shared,
  defineConfig({
    test: {
      // The rule harnesses use synchronous native subprocesses. Concurrent test
      // timers include time spent blocked by other fixtures in the same worker.
      sequence: { concurrent: false },
      fileParallelism: false,
      // Rule + parity harnesses spawn Biome as a subprocess; give them headroom.
      testTimeout: vitestCoverageRunActive || fcDeepSweepActive ? 300_000 : 30_000,
    },
  })
);
