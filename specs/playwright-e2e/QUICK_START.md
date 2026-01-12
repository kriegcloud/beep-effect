# Playwright E2E Quick Start

> 5-minute guide to implementing Playwright e2e tests in beep-effect.

---

## Prerequisites

- Playwright already installed (`playwright@^1.57.0`)
- Next.js dev server runnable (`bun run dev --filter @beep/web`)
- Understanding of Page Object Model pattern

---

## Step 1: Create Config (2 min)

Create `playwright.config.ts` in project root:

```typescript
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
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "bun run dev --filter @beep/web",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
```

---

## Step 2: Add Scripts (1 min)

Add to root `package.json`:

```json
{
  "scripts": {
    "e2e": "playwright test",
    "e2e:ui": "playwright test --ui",
    "e2e:headed": "playwright test --headed",
    "e2e:debug": "playwright test --debug",
    "e2e:report": "playwright show-report"
  }
}
```

---

## Step 3: Create First Test (2 min)

Create `e2e/smoke.e2e.ts`:

```typescript
import { test, expect } from "@playwright/test";

test.describe("Smoke Tests", () => {
  test("homepage loads", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Beep/i);
  });

  test("navigation works", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /dashboard/i }).click();
    await expect(page).toHaveURL(/dashboard/);
  });
});
```

---

## Step 4: Run Tests

```bash
# Run all e2e tests
bun run e2e

# Run with visual UI
bun run e2e:ui

# Run in headed mode (see browser)
bun run e2e:headed
```

---

## Next Steps

1. Read full spec: [README.md](./README.md)
2. Create auth fixture for authenticated tests
3. Implement Page Object Models for complex flows
4. Set up CI workflow

---

## Common Commands

| Command | Purpose |
|---------|---------|
| `bun run e2e` | Run all tests |
| `bun run e2e:ui` | Open Playwright UI |
| `bun run e2e -- --grep "auth"` | Run tests matching pattern |
| `bun run e2e -- --project=firefox` | Run specific browser |
| `bun run e2e:report` | View HTML report |
| `bunx playwright codegen` | Record new tests |

---

## Troubleshooting

### Dev server not starting
```bash
# Ensure web app builds successfully
bun run build --filter @beep/web
```

### Port conflict
Adjust `webServer.url` and `use.baseURL` in config.

### Slow tests
- Use `test.slow()` for known slow tests
- Check `webServer.timeout` if startup is slow
