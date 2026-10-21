import { defineConfig, mergeConfig } from "vitest/config";
import shared from "../../../../vitest.shared.ts";

export default mergeConfig(
  shared,
  defineConfig({
    test: {
      // The node-adapter errno parity fixtures assume tmpfs semantics (btrfs lets
      // copyFile read an empty directory, where the asserted EISDIR comes from tmpfs).
      env: { TMPDIR: "/tmp" },
    },
  })
);
