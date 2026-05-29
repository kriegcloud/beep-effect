import { defineConfig, mergeConfig } from "vitest/config";
import shared from "../../../../vitest.shared.ts";

export default mergeConfig(
  shared,
  defineConfig({
    test: {
      environment: "jsdom",
      setupFiles: [
        new URL("../../../../vitest.setup.ts", import.meta.url).pathname,
        new URL("./test/setup.ts", import.meta.url).pathname,
      ],
      sequence: {
        concurrent: false,
      },
    },
  })
);
