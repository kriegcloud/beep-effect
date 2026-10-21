import { defineConfig, mergeConfig } from "vitest/config";
import shared from "../../../vitest.shared.ts";

export default mergeConfig(
  shared,
  defineConfig({
    test: {
      // The ported suites share per-file fixture state (a module-level `requested` log that
      // property tests reset per run, and GitHubApp's clock- and fetch-scripted token rotation),
      // and they were written for the lab's sequential runner. The shared config runs tests
      // concurrently, which interleaves those runs, so this suite keeps its sequential order.
      sequence: { concurrent: false },
    },
  })
);
