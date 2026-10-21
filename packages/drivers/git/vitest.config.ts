import { defineConfig, mergeConfig } from "vitest/config";
import shared from "../../../vitest.shared.ts";

export default mergeConfig(
  shared,
  defineConfig({
    test: {
      // The integration fixtures are staged: fixture B's tests vendor a submodule, then fetch,
      // pin, narrow and clone it in declaration order. The shared config runs tests concurrently,
      // which races those stages, so this suite keeps the sequential order it was written for.
      sequence: { concurrent: false },
    },
  })
);
