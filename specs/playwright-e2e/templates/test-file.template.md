# E2E Test File Template

> Pattern for creating Playwright test files.

---

## Structure

```typescript
import { test, expect } from "@playwright/test";
import { {{PageName}}Page } from "@/e2e/pages/{{pageName}}.page";

test.describe("{{Feature}} Flow", () => {
  // ============================================
  // Setup (optional)
  // ============================================

  test.beforeEach(async ({ page }) => {
    // Navigate to starting point
    await page.goto("/{{route}}");
  });

  // ============================================
  // Tests
  // ============================================

  test("should {{expectedBehavior}}", async ({ page }) => {
    // Arrange
    const {{pageName}}Page = new {{PageName}}Page(page);

    // Act
    await {{pageName}}Page.{{action}}();

    // Assert
    await {{pageName}}Page.assert{{State}}();
  });

  test("should handle {{edgeCase}}", async ({ page }) => {
    const {{pageName}}Page = new {{PageName}}Page(page);

    await {{pageName}}Page.{{invalidAction}}();

    await {{pageName}}Page.assertError("{{errorMessage}}");
  });
});
```

---

## Principles

### 1. Arrange-Act-Assert Pattern
Structure every test with clear phases.

```typescript
test("should complete checkout", async ({ page }) => {
  // Arrange - Set up preconditions
  const checkoutPage = new CheckoutPage(page);
  await checkoutPage.goto();

  // Act - Perform the action
  await checkoutPage.fillShippingInfo(testAddress);
  await checkoutPage.submitOrder();

  // Assert - Verify outcome
  await checkoutPage.assertOrderConfirmed();
});
```

### 2. Use Page Objects for All Interactions
Never use raw `page.locator()` in tests.

```typescript
// GOOD: Use POM
const dashboardPage = new DashboardPage(page);
await dashboardPage.openSettings();

// BAD: Raw locators in test
await page.getByRole("button", { name: "Settings" }).click();
```

### 3. Descriptive Test Names
Use "should" format describing expected behavior.

```typescript
// GOOD: Describes behavior
test("should redirect to dashboard after login", ...);
test("should display error for invalid email", ...);

// BAD: Vague
test("login test", ...);
test("error handling", ...);
```

### 4. One Assertion Focus Per Test
Each test should verify one logical behavior.

```typescript
// GOOD: Single focus
test("should show loading state during upload", ...);
test("should display success message after upload", ...);
test("should update file list after upload", ...);

// BAD: Multiple unrelated assertions
test("upload flow", async () => {
  // checks loading, success, file list, navigation...
});
```

### 5. Use describe Blocks for Grouping
Organize related tests together.

```typescript
test.describe("Authentication", () => {
  test.describe("Login", () => {
    test("should login with valid credentials", ...);
    test("should reject invalid password", ...);
  });

  test.describe("Logout", () => {
    test("should clear session on logout", ...);
    test("should redirect to login page", ...);
  });
});
```

---

## Example: Auth Tests

```typescript
import { test, expect } from "@playwright/test";
import { AuthPage } from "@/e2e/pages/auth.page";

test.describe("Authentication Flow", () => {
  test.describe("Login", () => {
    test("should login with valid credentials", async ({ page }) => {
      // Arrange
      const authPage = new AuthPage(page);
      await authPage.goto();

      // Act
      await authPage.login("user@example.com", "password123");

      // Assert
      await authPage.assertLoggedIn();
    });

    test("should show error for invalid credentials", async ({ page }) => {
      // Arrange
      const authPage = new AuthPage(page);
      await authPage.goto();

      // Act
      await authPage.login("user@example.com", "wrongpassword");

      // Assert
      await authPage.assertLoginError("Invalid email or password");
    });

    test("should require email field", async ({ page }) => {
      // Arrange
      const authPage = new AuthPage(page);
      await authPage.goto();

      // Act
      await authPage.login("", "password123");

      // Assert
      await expect(authPage.emailInput()).toHaveAttribute("aria-invalid", "true");
    });
  });

  test.describe("Session Persistence", () => {
    test("should maintain session after page refresh", async ({ page }) => {
      const authPage = new AuthPage(page);
      await authPage.goto();
      await authPage.login("user@example.com", "password123");
      await authPage.assertLoggedIn();

      // Refresh page
      await page.reload();

      // Should still be logged in
      await authPage.assertLoggedIn();
    });
  });
});
```

---

## File Location

Place test files in `apps/*/e2e/`:

```
apps/
└── web/
    └── e2e/
        ├── auth.e2e.ts
        ├── dashboard.e2e.ts
        └── upload.e2e.ts
```

---

## Test Configuration

### Retries for Flaky Tests
```typescript
test.describe.configure({ retries: 2 });
```

### Slow Tests
```typescript
test("should complete long upload", async ({ page }) => {
  test.slow(); // Triples default timeout
  // ...
});
```

### Skip in CI
```typescript
test.skip(!!process.env.CI, "Skip in CI - requires local resources");
```

### Focused Testing
```typescript
test.only("debugging this test", ...);  // Run only this test
test.skip("known broken", ...);          // Skip this test
```
