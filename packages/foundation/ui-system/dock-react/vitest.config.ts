import * as NodeURL from "node:url";
import { defineConfig, mergeConfig } from "vitest/config";
import shared from "../../../../vitest.shared.ts";

export default mergeConfig(
  shared,
  defineConfig({
    root: import.meta.dirname,
    test: {
      environment: "jsdom",
      setupFiles: [NodeURL.fileURLToPath(new URL("./test/setup.dom.ts", import.meta.url))],
    },
  })
);
