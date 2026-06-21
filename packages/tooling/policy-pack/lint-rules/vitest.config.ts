import { defineConfig, mergeConfig } from "vitest/config";
import shared from "../../../../vitest.shared.ts";

export default mergeConfig(
  shared,
  defineConfig({
    test: {
      // Rule + parity harnesses spawn Biome as a subprocess; give them headroom.
      testTimeout: 30_000,
    },
  })
);
