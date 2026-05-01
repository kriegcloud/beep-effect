import { defineConfig, mergeConfig } from "vitest/config";
import shared from "../../vitest.shared.ts";

export default mergeConfig(
  shared,
  defineConfig({
    test: {
      include: ["scratchpad/schema-drizzle-projection/test/**/*.test.ts"],
    },
  })
);
