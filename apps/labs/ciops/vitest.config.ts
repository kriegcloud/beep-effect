import * as NodeURL from "node:url";
import { defineConfig, mergeConfig } from "vitest/config";
import shared, { vitestDoctestActive } from "../../../vitest.shared.ts";

export default mergeConfig(
  shared,
  defineConfig({
    resolve: {
      alias: {
        "@": NodeURL.fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
    test: {
      include: vitestDoctestActive ? [] : ["test/**/*.test.ts"],
    },
  })
);
