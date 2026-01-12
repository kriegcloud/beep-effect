# Playwright E2E — Phase 1 Orchestrator Prompt

> Ready-to-use prompt for executing Phase 1: Foundation.

---

## Context

You are implementing Phase 1 of the Playwright E2E testing spec for the beep-effect monorepo.

**Spec location**: `specs/playwright-e2e/`
**Current state**: Phase 0 complete, spec reviewed and improved
**Goal**: Set up Playwright infrastructure (config, fixtures, scripts, smoke test)

---

## Critical Rules

1. **Read before writing** - Always read existing files before modifying
2. **Use templates** - Follow patterns in `specs/playwright-e2e/templates/`
3. **Test incrementally** - Verify each step works before proceeding
4. **Effect patterns** - Use namespace imports in any TypeScript (e.g., `import * as A from "effect/Array"`)
5. **No native methods** - Route array/string operations through Effect utilities

---

## Execution Steps

### Step 1: Create Playwright Config

```bash
# Read the template first
cat specs/playwright-e2e/QUICK_START.md
```

Create `playwright.config.ts` in project root with:
- `testDir: "./e2e"`
- `testMatch: "**/*.e2e.ts"`
- `webServer` targeting `@beep/web`
- Chromium-only for local development

**Verify**:
```bash
bunx playwright test --list
```

### Step 2: Create Directory Structure

```bash
mkdir -p e2e/{fixtures,pages,utils}
mkdir -p apps/web/e2e
```

### Step 3: Create Base Fixture

Create `e2e/fixtures/base.fixture.ts`:
```typescript
import { test as base, expect } from "@playwright/test";

export const test = base;
export { expect };
```

### Step 4: Create Auth Setup

Create `e2e/fixtures/auth.setup.ts` following the pattern in:
`specs/playwright-e2e/templates/fixture.template.md`

Add to `.gitignore`:
```
# Playwright auth state
e2e/.auth/
```

### Step 5: Add NPM Scripts

Add to root `package.json` scripts:
```json
"e2e": "turbo run test:e2e",
"e2e:ui": "playwright test --ui",
"e2e:headed": "playwright test --headed",
"e2e:debug": "playwright test --debug",
"e2e:report": "playwright show-report"
```

### Step 6: Add Turbo Task

Add to `turbo.json` tasks:
```json
"test:e2e": {
  "dependsOn": ["^build"],
  "outputs": ["playwright-report/**", "test-results/**"],
  "cache": false
}
```

### Step 7: Create Smoke Test

Create `e2e/smoke.e2e.ts`:
```typescript
import { test, expect } from "@playwright/test";

test.describe("Smoke Tests", () => {
  test("homepage loads", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/./); // Any title
  });
});
```

### Step 8: Verify Setup

```bash
# List available tests
bunx playwright test --list

# Run smoke test
bun run e2e -- e2e/smoke.e2e.ts

# Open UI mode
bun run e2e:ui
```

---

## Success Criteria

Before marking Phase 1 complete:

- [ ] `playwright.config.ts` exists and `bunx playwright test --list` works
- [ ] Directory structure created (`e2e/fixtures/`, `e2e/pages/`, `e2e/utils/`, `apps/web/e2e/`)
- [ ] `e2e/fixtures/base.fixture.ts` exports test and expect
- [ ] `e2e/fixtures/auth.setup.ts` created (may need adjustment based on actual auth flow)
- [ ] `e2e/.auth/` in `.gitignore`
- [ ] NPM scripts added and `bun run e2e:ui` works
- [ ] `test:e2e` task in `turbo.json`
- [ ] Smoke test passes

---

## After Phase 1

1. Update `specs/playwright-e2e/REFLECTION_LOG.md` with learnings
2. Create `handoffs/HANDOFF_P2.md` if continuing to Phase 2
3. Proceed to Phase 2: Page Objects & Patterns

---

## References

- Full spec: `specs/playwright-e2e/README.md`
- Templates: `specs/playwright-e2e/templates/`
- Quick start: `specs/playwright-e2e/QUICK_START.md`
- Handoff context: `specs/playwright-e2e/handoffs/HANDOFF_P1.md`
