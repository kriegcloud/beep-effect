import { defineConfig, mergeConfig } from "vitest/config";
import shared from "../../../vitest.shared.ts";

export default mergeConfig(
  shared,
  defineConfig({
    test: {
      hookTimeout: 30_000,
      // PGlite is a WASM Postgres; a cold build/teardown inside a test body
      // (e.g. the layer-lifecycle test) can exceed vitest's 5s default under CI
      // load. Match the generous hookTimeout so in-body PGlite work doesn't flake.
      testTimeout: 30_000,
    },
  })
);
