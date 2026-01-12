# Page Object Model Template

> Pattern for creating Page Object classes in Playwright tests.

---

## Structure

```typescript
import type { Locator, Page } from "@playwright/test";
import { expect } from "@playwright/test";

/**
 * Page Object for {{PageName}} page.
 *
 * Encapsulates page interactions and assertions for the {{route}} route.
 */
export class {{PageName}}Page {
  readonly page: Page;

  // ============================================
  // Locators (lazy - called as functions)
  // ============================================

  readonly {{element}}Input = (): Locator =>
    this.page.getByLabel("{{Label}}");

  readonly {{element}}Button = (): Locator =>
    this.page.getByRole("button", { name: "{{ButtonText}}" });

  readonly {{element}}Link = (): Locator =>
    this.page.getByRole("link", { name: "{{LinkText}}" });

  // ============================================
  // Constructor
  // ============================================

  constructor(page: Page) {
    this.page = page;
  }

  // ============================================
  // Navigation
  // ============================================

  async goto(): Promise<void> {
    await this.page.goto("/{{route}}");
  }

  // ============================================
  // Actions
  // ============================================

  async {{action}}({{params}}): Promise<void> {
    await this.{{element}}Input().fill({{value}});
    await this.{{element}}Button().click();
  }

  // ============================================
  // Assertions
  // ============================================

  async assertVisible(): Promise<void> {
    await expect(this.page).toHaveURL(/{{urlPattern}}/);
  }

  async assert{{State}}(): Promise<void> {
    await expect(this.{{element}}()).toBeVisible();
  }
}
```

---

## Principles

### 1. Composition Over Inheritance
Do NOT create deep POM hierarchies. Each page is self-contained.

```typescript
// GOOD: Composition
class DashboardPage {
  constructor(private page: Page) {}
}

// BAD: Inheritance
class BasePage {
  constructor(protected page: Page) {}
}
class DashboardPage extends BasePage { ... }
```

### 2. Lazy Locators
Return locators as functions to avoid stale element references.

```typescript
// GOOD: Lazy locator
readonly submitButton = () => this.page.getByRole("button", { name: "Submit" });

// BAD: Eager locator (can go stale)
readonly submitButton = this.page.getByRole("button", { name: "Submit" });
```

### 3. Semantic Selectors
Prefer accessibility-based selectors over CSS selectors.

```typescript
// GOOD: Semantic
this.page.getByRole("button", { name: "Submit" });
this.page.getByLabel("Email address");
this.page.getByText("Welcome back");

// BAD: Implementation details
this.page.locator(".btn-primary");
this.page.locator("#email-input");
```

### 4. Encapsulated Assertions
Keep assertions in the POM, not in tests.

```typescript
// GOOD: POM handles assertion
class AuthPage {
  async assertLoggedIn(): Promise<void> {
    await expect(this.page).toHaveURL(/dashboard/);
    await expect(this.userMenu()).toBeVisible();
  }
}

// Test is clean
await authPage.assertLoggedIn();
```

---

## Example: AuthPage

```typescript
import type { Locator, Page } from "@playwright/test";
import { expect } from "@playwright/test";

export class AuthPage {
  readonly page: Page;

  // Locators
  readonly emailInput = (): Locator => this.page.getByLabel("Email");
  readonly passwordInput = (): Locator => this.page.getByLabel("Password");
  readonly signInButton = (): Locator => this.page.getByRole("button", { name: "Sign in" });
  readonly errorMessage = (): Locator => this.page.getByRole("alert");
  readonly userMenu = (): Locator => this.page.getByTestId("user-menu");

  constructor(page: Page) {
    this.page = page;
  }

  async goto(): Promise<void> {
    await this.page.goto("/auth/login");
  }

  async login(email: string, password: string): Promise<void> {
    await this.emailInput().fill(email);
    await this.passwordInput().fill(password);
    await this.signInButton().click();
  }

  async assertLoggedIn(): Promise<void> {
    await expect(this.page).toHaveURL(/dashboard/);
    await expect(this.userMenu()).toBeVisible();
  }

  async assertLoginError(message: string): Promise<void> {
    await expect(this.errorMessage()).toContainText(message);
  }
}
```

---

## File Location

Place POMs in `e2e/pages/`:

```
e2e/
├── pages/
│   ├── auth.page.ts
│   ├── dashboard.page.ts
│   └── upload.page.ts
```
