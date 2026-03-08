import { defineConfig, mergeConfig } from "vitest/config";
import shared from "../../../vitest.shared.ts";

const isIriFocusedRun = process.argv.includes("test/IRI.test.ts");

export default mergeConfig(
  shared,
  defineConfig({
    test: {
      coverage: isIriFocusedRun
        ? {
            include: ["src/internal/IRI/IRI.ts"],
          }
        : undefined,
    },
  })
);
// bench
