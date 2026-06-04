import path from "node:path";
import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig, mergeConfig } from "vitest/config";
import shared from "../../../../vitest.shared.ts";

// Two Vitest projects in one config:
// - `unit`: the package's Node unit tests under `test/` (run by `beep:test` and
//   `coverage`, both scoped via `--project unit` so they never need a browser).
// - `storybook`: the browser-mode Storybook component tests. `@storybook/addon-vitest`'s
//   in-Storybook "Run component tests" widget discovers this project by scanning for a
//   config that references `storybookTest` / `@storybook/addon-vitest`, so the project
//   must live here (not only in the standalone `vitest.storybook.config.ts` that the
//   `test:storybook --config` lane uses).
export default defineConfig({
  test: {
    projects: [
      mergeConfig(
        shared,
        defineConfig({
          test: {
            name: "unit",
            coverage: {
              include: ["src/index.ts", "src/lib/url.ts", "src/lib/utils.ts"],
            },
          },
        })
      ),
      {
        plugins: [
          storybookTest({
            configDir: path.resolve(import.meta.dirname, ".storybook"),
          }),
        ],
        test: {
          name: "storybook",
          setupFiles: [path.resolve(import.meta.dirname, "vitest.storybook.setup.ts")],
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({}),
            instances: [{ browser: "chromium" }],
          },
        },
      },
    ],
  },
});
