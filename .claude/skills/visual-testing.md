---
paths:
  - "apps/**/tests/**/*"
  - "**/*.spec.ts"
  - "**/*.test.ts"
---

# Visual Testing Skill

Generate Playwright test files for UI component verification.

## When to Invoke

Invoke this skill when:
- Creating visual regression tests for UI components
- Verifying component rendering and interactions
- Setting up accessibility tests
- Building end-to-end test suites for UI features

## MCP Server Prerequisites

**Playwright MCP is NOT available in this session.**

### Fallback Strategy (ACTIVE)

Since Playwright MCP cannot be enabled, this skill generates test files for manual/CI execution:
1. Generate `.spec.ts` files with Playwright test syntax
2. Include instructions for running tests
3. Use accessibility tree assertions (more reliable than screenshots)
4. Target elements via `data-testid` attributes

---

## Initial Setup (First Time Only)

Before generating tests, ensure Playwright is configured:

### 1. Install Dependencies

```bash
bun add -d @playwright/test @axe-core/playwright
bunx playwright install chromium
```

### 2. Create playwright.config.ts

```typescript
// apps/web/playwright.config.ts
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: process.env.BASE_URL ?? "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },
    {
      name: "mobile-chrome",
      use: { ...devices["Pixel 5"] },
    },
  ],
  webServer: {
    command: "bun run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
  },
});
```

### 3. Add Script to package.json

```json
{
  "scripts": {
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui"
  }
}
```

### 4. Create Test Directory

```bash
mkdir -p apps/web/tests/e2e
```

---

## Critical Constraints

1. **Test File Location** — Place tests in `apps/[app]/tests/e2e/` or adjacent to components
2. **Selector Strategy** — Prefer `data-testid` attributes over CSS selectors
3. **Accessibility First** — Use accessibility tree for assertions when possible
4. **Isolation** — Each test should be independent and self-contained
5. **No Hardcoded URLs** — Use environment variables or fixtures for URLs
6. **Component Test IDs** — Ensure tested components have `data-testid` (see `atomic-component.md`)

---

## Workflow

### Step 1: Parse Requirements

Extract from user request:
- Component(s) to test
- Test scenarios (render, interaction, state changes)
- Viewport/device requirements
- Screenshot baseline needs

### Step 2: Check Existing Tests

```typescript
// Find existing test patterns
Glob({ pattern: "apps/**/tests/**/*.spec.ts" })

// Search for test utilities
Grep({ pattern: "test\\(", path: "apps/web/tests" })
```

### Step 3: Identify Test Elements

Ensure components have proper `data-testid` attributes:

```typescript
// In component
<Button data-testid="submit-button">Submit</Button>
<Dialog data-testid="confirm-dialog">...</Dialog>
```

### Step 4: Generate Test File

Follow the output template below.

### Step 5: Run Tests

Provide instructions:
```bash
bun run test:e2e --project=chromium
```

---

## Output Template

```typescript
import { test, expect, type Page } from "@playwright/test";

// Test constants
const BASE_URL = process.env.BASE_URL ?? "http://localhost:3000";
const COMPONENT_PAGE = "/demo/component-name";

// Helper functions
async function navigateToComponent(page: Page) {
  await page.goto(`${BASE_URL}${COMPONENT_PAGE}`);
  await page.waitForLoadState("networkidle");
}

// Test suite
test.describe("ComponentName", () => {
  test.beforeEach(async ({ page }) => {
    await navigateToComponent(page);
  });

  test("renders correctly", async ({ page }) => {
    // Wait for component to be visible
    const component = page.locator('[data-testid="component-root"]');
    await expect(component).toBeVisible();

    // Verify key elements
    await expect(page.locator('[data-testid="component-title"]')).toHaveText("Expected Title");
  });

  test("handles user interaction", async ({ page }) => {
    // Click action
    await page.click('[data-testid="action-button"]');

    // Verify state change
    await expect(page.locator('[data-testid="result"]')).toBeVisible();
  });

  test("responds to keyboard input", async ({ page }) => {
    // Focus element
    await page.locator('[data-testid="input-field"]').focus();

    // Type input
    await page.keyboard.type("test input");

    // Verify value
    await expect(page.locator('[data-testid="input-field"]')).toHaveValue("test input");
  });

  test("meets accessibility requirements", async ({ page }) => {
    // Get accessibility snapshot
    const accessibilityTree = await page.accessibility.snapshot();

    // Verify key accessible elements exist
    expect(accessibilityTree?.children?.some(
      (node) => node.role === "button" && node.name === "Submit"
    )).toBe(true);
  });

  test.describe("visual regression", () => {
    test("matches baseline screenshot", async ({ page }) => {
      // Take screenshot of component
      await expect(page.locator('[data-testid="component-root"]')).toHaveScreenshot(
        "component-default.png",
        { maxDiffPixels: 100 }
      );
    });

    test("matches hover state", async ({ page }) => {
      // Hover over element
      await page.locator('[data-testid="hoverable-element"]').hover();

      // Screenshot hover state
      await expect(page.locator('[data-testid="component-root"]')).toHaveScreenshot(
        "component-hover.png",
        { maxDiffPixels: 100 }
      );
    });
  });
});
```

---

## Selector Strategy

### Preferred: data-testid

```typescript
// Most reliable - explicit test targeting
page.locator('[data-testid="submit-button"]')
```

### Alternative: Role + Name

```typescript
// Good for accessibility testing
page.getByRole("button", { name: "Submit" })
page.getByRole("textbox", { name: "Email" })
page.getByRole("dialog", { name: "Confirm" })
```

### Avoid: CSS Classes

```typescript
// Fragile - changes with styling
page.locator(".MuiButton-containedPrimary")  // AVOID
```

---

## Common Test Patterns

### Form Submission

```typescript
test("submits form successfully", async ({ page }) => {
  // Fill form
  await page.locator('[data-testid="name-input"]').fill("John Doe");
  await page.locator('[data-testid="email-input"]').fill("john@example.com");

  // Submit
  await page.click('[data-testid="submit-button"]');

  // Verify success
  await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
});
```

### Modal/Dialog

```typescript
test("opens and closes dialog", async ({ page }) => {
  // Open dialog
  await page.click('[data-testid="open-dialog-button"]');
  await expect(page.locator('[data-testid="dialog"]')).toBeVisible();

  // Close dialog
  await page.click('[data-testid="close-button"]');
  await expect(page.locator('[data-testid="dialog"]')).not.toBeVisible();
});
```

### Data Table

```typescript
test("displays and sorts data", async ({ page }) => {
  // Verify table renders
  const rows = page.locator('[data-testid="table-row"]');
  await expect(rows).toHaveCount(10);

  // Sort by column
  await page.click('[data-testid="column-header-name"]');

  // Verify sort order
  const firstCell = page.locator('[data-testid="table-row"]:first-child [data-testid="cell-name"]');
  await expect(firstCell).toHaveText("Aaron");
});
```

### Theme Toggle

```typescript
test("toggles dark mode", async ({ page }) => {
  // Initial state
  await expect(page.locator("html")).not.toHaveClass(/dark/);

  // Toggle theme
  await page.click('[data-testid="theme-toggle"]');

  // Verify dark mode
  await expect(page.locator("html")).toHaveClass(/dark/);
});
```

---

## Viewport Testing

```typescript
test.describe("responsive design", () => {
  test("renders correctly on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
    await navigateToComponent(page);

    // Mobile-specific assertions
    await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible();
    await expect(page.locator('[data-testid="desktop-nav"]')).not.toBeVisible();
  });

  test("renders correctly on tablet", async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 }); // iPad
    await navigateToComponent(page);

    // Tablet-specific assertions
  });

  test("renders correctly on desktop", async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await navigateToComponent(page);

    // Desktop-specific assertions
    await expect(page.locator('[data-testid="desktop-nav"]')).toBeVisible();
  });
});
```

---

## Accessibility Testing

```typescript
import AxeBuilder from "@axe-core/playwright";

test("has no accessibility violations", async ({ page }) => {
  await navigateToComponent(page);

  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa"])
    .analyze();

  expect(results.violations).toEqual([]);
});
```

---

## Example Invocations

### Example 1: Test Button Component

**User request**: "Create visual tests for the Button component"

**Actions**:
1. Create `apps/web/tests/e2e/button.spec.ts`
2. Test all variants (contained, outlined, soft, text)
3. Test all colors (primary, secondary, error, etc.)
4. Test sizes (small, medium, large)
5. Test disabled state
6. Take screenshots for visual regression

### Example 2: Test Form Flow

**User request**: "Create e2e tests for the user registration form"

**Actions**:
1. Create `apps/web/tests/e2e/registration.spec.ts`
2. Test successful registration flow
3. Test validation error display
4. Test form submission with invalid data
5. Test accessibility of form elements

---

## Running Tests

```bash
# Run all e2e tests
bun run test:e2e

# Run specific test file
bun run test:e2e apps/web/tests/e2e/button.spec.ts

# Run with specific browser
bun run test:e2e --project=chromium
bun run test:e2e --project=firefox
bun run test:e2e --project=webkit

# Run in headed mode (for debugging)
bun run test:e2e --headed

# Update screenshots
bun run test:e2e --update-snapshots
```

---

## Related Skills

| Skill | Relationship |
|-------|--------------|
| `atomic-component.md` | Components MUST have `data-testid` attributes for selectors |
| `form-field.md` | Form fields need `data-testid` on inputs for test targeting |
| `mui-component-override.md` | Theme changes require visual regression tests |
| `effect-check.md` | Test files don't use Effect (validation not needed) |

**Prerequisite Coordination:**
- Before testing a component, verify it has `data-testid` attributes
- If missing, use `atomic-component.md` guidance to add them
- Form fields should follow `form-field.md` conventions for test targeting

**Workflow Integration:**
1. Create/update component with `atomic-component.md` (adds test IDs)
2. Generate tests with this skill
3. Run `bun run test:e2e` to verify
4. Update screenshots with `--update-snapshots` if visual changes are intentional

---

## Verification Checklist

- [ ] Playwright config exists (`playwright.config.ts`)
- [ ] Test file follows naming convention (`*.spec.ts`)
- [ ] Tests are isolated and independent
- [ ] Uses `data-testid` selectors where possible
- [ ] Includes accessibility assertions
- [ ] Handles async loading states
- [ ] Uses environment variables for URLs
- [ ] Includes visual regression tests where appropriate
- [ ] Tests cover key user interactions
- [ ] Tests are deterministic (no flaky assertions)
- [ ] Includes instructions for running tests
