# Playwright Fixture Template

> Pattern for creating custom Playwright fixtures.

---

## Structure

```typescript
import { test as base, expect } from "@playwright/test";

// ============================================
// Type Definitions
// ============================================

type {{FixtureName}}Fixtures = {
  {{fixtureName}}: {{FixtureType}};
};

// ============================================
// Fixture Extension
// ============================================

export const test = base.extend<{{FixtureName}}Fixtures>({
  {{fixtureName}}: async ({ page }, use) => {
    // ----------------------------------------
    // Setup Phase
    // ----------------------------------------
    const {{resource}} = await create{{Resource}}();

    // ----------------------------------------
    // Use Phase (test runs here)
    // ----------------------------------------
    await use({{resource}});

    // ----------------------------------------
    // Teardown Phase
    // ----------------------------------------
    await {{resource}}.cleanup();
  },
});

export { expect };
```

---

## Auth Fixture Pattern

The most common fixture authenticates users via `storageState`.

### Setup Script: `e2e/fixtures/auth.setup.ts`

```typescript
import { test as setup, expect } from "@playwright/test";

const authFile = "e2e/.auth/user.json";

setup("authenticate", async ({ page }) => {
  // Navigate to login
  await page.goto("/auth/login");

  // Perform login
  await page.getByLabel("Email").fill("test@example.com");
  await page.getByLabel("Password").fill("password123");
  await page.getByRole("button", { name: "Sign in" }).click();

  // Wait for login to complete
  await expect(page).toHaveURL(/dashboard/);

  // Save authentication state
  await page.context().storageState({ path: authFile });
});
```

### Auth Fixture: `e2e/fixtures/auth.fixture.ts`

```typescript
import { test as base } from "@playwright/test";

export const test = base.extend({
  // Use authenticated storage state
  storageState: "e2e/.auth/user.json",
});

export { expect } from "@playwright/test";
```

### Playwright Config Integration

```typescript
// playwright.config.ts
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  projects: [
    // Setup project - runs first
    {
      name: "setup",
      testMatch: /.*\.setup\.ts/,
    },

    // Authenticated tests - depend on setup
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        storageState: "e2e/.auth/user.json",
      },
      dependencies: ["setup"],
    },

    // Unauthenticated tests - no storage state
    {
      name: "chromium-unauthenticated",
      use: { ...devices["Desktop Chrome"] },
      testMatch: /.*\.unauth\.e2e\.ts/,
    },
  ],
});
```

---

## Database Fixture Pattern

For tests requiring database state.

```typescript
import { test as base } from "@playwright/test";
import * as Effect from "effect/Effect";

type DbFixtures = {
  testDb: TestDatabase;
};

export const test = base.extend<DbFixtures>({
  testDb: async ({}, use) => {
    // Setup: Create isolated test database
    const db = await Effect.runPromise(
      Effect.gen(function* () {
        const conn = yield* TestDatabase.connect;
        yield* conn.migrate();
        return conn;
      })
    );

    // Use
    await use(db);

    // Teardown: Clean up
    await Effect.runPromise(db.truncateAll());
  },
});
```

---

## Mock API Fixture Pattern

For mocking external API responses.

```typescript
import { test as base } from "@playwright/test";
import type { Page, Route } from "@playwright/test";

type ApiMockFixtures = {
  mockApi: ApiMocker;
};

class ApiMocker {
  constructor(private page: Page) {}

  async mockEndpoint(
    url: string | RegExp,
    response: { status: number; body: unknown }
  ): Promise<void> {
    await this.page.route(url, async (route: Route) => {
      await route.fulfill({
        status: response.status,
        contentType: "application/json",
        body: JSON.stringify(response.body),
      });
    });
  }

  async mockError(url: string | RegExp, status: number): Promise<void> {
    await this.page.route(url, async (route: Route) => {
      await route.fulfill({
        status,
        contentType: "application/json",
        body: JSON.stringify({ error: "Mocked error" }),
      });
    });
  }
}

export const test = base.extend<ApiMockFixtures>({
  mockApi: async ({ page }, use) => {
    const mocker = new ApiMocker(page);
    await use(mocker);
  },
});
```

### Usage in Tests

```typescript
import { test, expect } from "@/e2e/fixtures/api.fixture";

test("should handle API error gracefully", async ({ page, mockApi }) => {
  // Mock the API to return an error
  await mockApi.mockError("/api/users", 500);

  await page.goto("/dashboard");

  // Verify error handling UI
  await expect(page.getByText("Failed to load data")).toBeVisible();
});
```

---

## Composing Multiple Fixtures

Combine fixtures by extending sequentially.

```typescript
import { test as base } from "@playwright/test";
import { test as authTest } from "./auth.fixture";

// Start from auth fixture (already extended)
export const test = authTest.extend({
  // Add more fixtures
  testDb: async ({}, use) => {
    const db = await setupTestDb();
    await use(db);
    await db.cleanup();
  },

  mockApi: async ({ page }, use) => {
    const mocker = new ApiMocker(page);
    await use(mocker);
  },
});
```

---

## File Location

```
e2e/
├── fixtures/
│   ├── auth.setup.ts      # Authentication setup script
│   ├── auth.fixture.ts    # Authenticated test fixture
│   ├── db.fixture.ts      # Database fixture
│   └── base.fixture.ts    # Composed base fixture
└── .auth/
    └── user.json          # Saved auth state (gitignored)
```

---

## .gitignore Entry

```gitignore
# Playwright auth state
e2e/.auth/
```
