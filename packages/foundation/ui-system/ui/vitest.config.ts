import { defineConfig, mergeConfig } from "vitest/config";
import shared from "../../../../vitest.shared.ts";

export default mergeConfig(
  shared,
  defineConfig({
    test: {
      coverage: {
        include: ["src/index.ts", "src/lib/url.ts", "src/lib/utils.ts"],
      },
    },
  })
);
