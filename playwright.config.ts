/// <reference types="bun" />
import { defineConfig, devices } from "@playwright/test";

const isCI = !!process.env.CI;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 1 : undefined,
  reporter: "html",

  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  // Self-contained: start servers automatically
  webServer: [
    {
      command: "bun run --filter=server dev",
      url: "http://localhost:9000",
      reuseExistingServer: !isCI,
      timeout: 120 * 1000,
    },
    {
      command: "bun run --filter=client dev",
      url: "http://localhost:3000",
      reuseExistingServer: !isCI,
      timeout: 120 * 1000,
    },
  ],
});
