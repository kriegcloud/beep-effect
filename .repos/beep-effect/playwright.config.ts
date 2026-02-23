import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  testMatch: "**/*.e2e.ts",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ["html", { open: "never" }],
    ["list"],
  ],
  use: {
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    // Main web app tests (port 3000)
    {
      name: "chromium-web",
      testMatch: /smoke\.e2e\.ts/,
      use: {
        ...devices["Desktop Chrome"],
        baseURL: "http://localhost:3000",
      },
    },
    // FlexLayout tests on todox app (port 3001)
    {
      name: "chromium-flexlayout",
      testMatch: /flexlayout.*\.e2e\.ts/,
      use: {
        ...devices["Desktop Chrome"],
        baseURL: "http://localhost:3001",
      },
      timeout: 60000,
    },
  ],
  webServer: [
    {
      command: "dotenvx run -f ../../.env -- bunx next dev --turbopack -p 3000",
      url: "http://localhost:3000",
      reuseExistingServer: !process.env.CI,
      timeout: 120000,
      cwd: "./apps/web",
    },
    {
      command: "dotenvx run -f ../../.env -- bunx next dev --turbopack -p 3001",
      url: "http://localhost:3001",
      reuseExistingServer: !process.env.CI,
      timeout: 120000,
      cwd: "./apps/todox",
    },
  ],
});
