import { defineConfig, mergeConfig } from "vitest/config";
import shared from "../../../vitest.shared.ts";

const isIriFocusedRun = process.argv.includes("test/IRI.test.ts");

export default mergeConfig(
  shared,
  defineConfig({
    test: {
      ...(isIriFocusedRun
        ? {
            coverage: {
              include: ["src/internal/IRI/IRI.ts"],
            },
          }
        : {}),
    },
  })
);
// bench
