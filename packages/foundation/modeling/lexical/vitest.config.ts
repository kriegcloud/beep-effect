import { defineConfig, mergeConfig } from "vitest/config";
import shared from "../../../../vitest.shared.ts";

export default mergeConfig(
  shared,
  defineConfig({
    test: {
      // The codec round-trip property tests do real encode/decode work over
      // arbitrary editor states; under CI's parallel test load they can exceed
      // vitest's 5s default (they run in ~1.2s locally). Give generous headroom.
      testTimeout: 30_000,
    },
  })
);
