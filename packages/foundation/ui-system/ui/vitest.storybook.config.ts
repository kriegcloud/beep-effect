import path from "node:path";
import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";

export default defineConfig({
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
});
