import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [
    storybookTest({
      configDir: new URL(".storybook", import.meta.url).pathname,
    }),
  ],
  test: {
    name: "storybook",
    setupFiles: [new URL("vitest.storybook.setup.ts", import.meta.url).pathname],
    browser: {
      enabled: true,
      headless: true,
      provider: playwright({}),
      instances: [{ browser: "chromium" }],
    },
  },
});
