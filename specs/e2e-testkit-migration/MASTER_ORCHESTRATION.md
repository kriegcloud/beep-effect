# Master Orchestration: E2E Testkit Migration

## Orchestrator Instructions

This document provides step-by-step instructions for an AI agent orchestrating the migration of e2e tests from raw `@playwright/test` to `@beep/testkit/playwright`.

## Prerequisites

Before starting, verify:

```bash
# Ensure clean working state
git status

# Verify testkit playwright module exists
ls tooling/testkit/src/playwright/

# Verify current e2e tests run
bun run test:e2e
```

## Phase 1: Discovery (Read-Only)

### Step 1.1: Catalog Current Tests

Use the `codebase-researcher` agent to create a complete inventory:

```
Task: Catalog all e2e test files, their test cases, and dependencies.

Focus areas:
1. List all test files in ./e2e/ with line counts
2. Extract all test() and describe() blocks from each file
3. Identify all imports and dependencies
4. Document helper functions in ./e2e/utils/
5. Note any external fixtures or test data

Output: outputs/codebase-context.md
```

### Step 1.2: Research Effect Patterns

Use the `mcp-researcher` agent to gather Effect documentation:

```
Task: Research Effect patterns relevant to browser automation testing.

Focus areas:
1. Effect.fn() decorator patterns
2. Scoped resource management for browser lifecycle
3. Stream-based event handling
4. Error channel patterns for async operations
5. Layer composition for test fixtures

Output: outputs/effect-research.md
```

### Step 1.3: Create Handoff

Write `handoffs/HANDOFF_P1.md` summarizing:
- Total test count and complexity assessment
- Key patterns found in legacy code
- Potential migration challenges identified
- Questions for Phase 2

---

## Phase 2: Evaluation

### Step 2.1: Guideline Compliance Review

Use the `code-reviewer` agent:

```
Task: Evaluate current e2e tests against .claude/rules/effect-patterns.md

Checklist:
- [ ] Namespace imports (currently using named imports from @playwright/test)
- [ ] Error handling (currently using try/catch or unhandled)
- [ ] Resource management (currently implicit browser lifecycle)
- [ ] Testing framework (currently raw @playwright/test, not @beep/testkit)

Score each file on compliance and identify specific violations.

Output: outputs/guideline-review.md
```

### Step 2.2: Architecture Review

Use the `architecture-pattern-enforcer` agent:

```
Task: Validate proposed migration architecture

Evaluate:
1. PlaywrightEnvironment.layer() composition
2. Service tag usage (PlaywrightPage, PlaywrightLocator, etc.)
3. Helper function Layer vs utility function decision
4. Test organization (layer() vs effect() usage)

Output: outputs/architecture-review.md
```

### Step 2.3: Create Handoff

Write `handoffs/HANDOFF_P2.md` summarizing:
- Compliance scores per file
- Architectural decisions made
- Identified blockers or concerns
- Recommended migration order

---

## Phase 3: Synthesis

### Step 3.1: Consolidate Learnings

Use the `reflector` agent:

```
Task: Analyze Phase 1-2 outputs and extract actionable insights

Consider:
1. What patterns from current tests should be preserved?
2. What anti-patterns should be eliminated?
3. What Effect patterns from testkit module should be emphasized?
4. What documentation gaps exist?

Output: outputs/meta-reflection-synthesis.md
```

### Step 3.2: Generate Migration Plan

Create detailed file-by-file migration plan:

#### 3.2.1: smoke.e2e.ts (Simplest First)

```typescript
// BEFORE (8 lines)
import { test, expect } from "@playwright/test";

test("homepage loads", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Web/);
});

// AFTER (~20 lines)
import { layer } from "@beep/testkit";
import { PlaywrightEnvironment, PlaywrightPage } from "@beep/testkit/playwright";
import { chromium } from "playwright";
import * as Effect from "effect/Effect";
import { assert } from "@beep/testkit";

layer(PlaywrightEnvironment.layer(chromium))("smoke tests", (it) => {
  it.scoped("homepage loads",
    Effect.fn(function* () {
      const page = yield* PlaywrightPage;
      yield* page.goto("http://localhost:3000");
      const title = yield* page.title;
      assert(title.includes("Web"), "Title should contain 'Web'");
    }, PlaywrightEnvironment.withBrowser)
  );
});
```

#### 3.2.2: utils/helpers.ts (Convert Utilities)

```typescript
// BEFORE - imperative async function
export async function findPath(page: Page, path: string) {
  return page.locator(`[data-layout-path='${path}']`);
}

// AFTER - Effect-returning function
export const findPath = (page: PlaywrightPage.Service, path: string) =>
  Effect.succeed(page.locator(`[data-layout-path='${path}']`));
```

```typescript
// BEFORE - complex drag operation
export async function drag(page: Page, from: Locator, to: Locator, location: Location) {
  const fromRect = await from.boundingBox();
  const toRect = await to.boundingBox();
  // ... mouse operations
}

// AFTER - Effect-wrapped drag
export const drag = (
  page: PlaywrightPage.Service,
  from: PlaywrightLocator.Service,
  to: PlaywrightLocator.Service,
  location: Location
) =>
  Effect.gen(function* () {
    // Use escape hatch for complex mouse operations
    yield* page.use(async (p) => {
      const fromRect = yield* from.use((l) => l.boundingBox());
      const toRect = yield* to.use((l) => l.boundingBox());
      // ... mouse operations using raw page
    });
  });
```

#### 3.2.3: flexlayout.e2e.ts (Complex Migration)

This file requires careful migration of 11 describe blocks:

1. `describe("functional")` - 7 tests
2. `describe("border panels")` - 3 tests
3. `describe("drag")` - 7 tests
4. `describe("external drag")` - 3 tests
5. `describe("splitters")` - 4 tests
6. `describe("nested tabsets")` - 5 tests
7. `describe("popup")` - 3 tests
8. `describe("maximize")` - 4 tests
9. `describe("action buttons")` - 5 tests
10. `describe("overflow menu")` - 5 tests
11. `describe("serialization")` - 4 tests

Migration strategy: Convert one describe block at a time, verifying tests pass before proceeding.

### Step 3.3: Create Handoff

Write `handoffs/HANDOFF_P3.md` with:
- Final migration plan
- Estimated effort per file
- Test execution order
- Rollback strategy

---

## Phase 4: Implementation

### Step 4.1: Migrate Smoke Tests

```bash
# Create migrated smoke test
# Run verification
bun run test:e2e --grep "smoke"
```

### Step 4.2: Migrate Helpers

Convert `e2e/utils/helpers.ts` to Effect patterns:

```bash
# After conversion, verify no type errors
bun run check
```

### Step 4.3: Migrate FlexLayout Tests (Incremental)

For each describe block:

```bash
# 1. Convert describe block
# 2. Run specific tests
bun run test:e2e --grep "flexlayout.*functional"

# 3. If passing, proceed to next block
# 4. If failing, debug and fix before continuing
```

### Step 4.4: Update Configuration

Update `e2e/tsconfig.json` if needed:

```json
{
  "compilerOptions": {
    "paths": {
      "@beep/testkit": ["../../tooling/testkit/src/index.ts"],
      "@beep/testkit/*": ["../../tooling/testkit/src/*"]
    }
  }
}
```

### Step 4.5: Clean Up

Remove deprecated files:
- `e2e/fixtures/base.fixture.ts` (if no longer needed)
- Any unused imports in migrated files

### Step 4.6: Final Verification

```bash
# Run all e2e tests
bun run test:e2e

# Run type check
bun run check

# Run lint
bun run lint
```

---

## Conversion Reference

### Import Mapping

| Legacy Import | Effect Import |
|---------------|---------------|
| `import { test } from "@playwright/test"` | `import { layer } from "@beep/testkit"` |
| `import { expect } from "@playwright/test"` | `import { assert, strictEqual } from "@beep/testkit"` |
| `import { Page } from "@playwright/test"` | `import { PlaywrightPage } from "@beep/testkit/playwright"` |
| `import { Locator } from "@playwright/test"` | `import { PlaywrightLocator } from "@beep/testkit/playwright"` |

### Async Operation Mapping

| Legacy | Effect |
|--------|--------|
| `await page.goto(url)` | `yield* page.goto(url)` |
| `await page.click(sel)` | `yield* page.locator(sel).click()` |
| `await page.fill(sel, val)` | `yield* page.locator(sel).fill(val)` |
| `await locator.textContent()` | `yield* locator.textContent()` |
| `await locator.boundingBox()` | `yield* locator.use(l => l.boundingBox())` |

### Assertion Mapping

| Legacy | Effect |
|--------|--------|
| `expect(value).toBe(expected)` | `strictEqual(value, expected)` |
| `expect(value).toBeTruthy()` | `assert(value, "message")` |
| `expect(locator).toBeVisible()` | `yield* locator.use(l => expect(l).toBeVisible())` |

### Test Structure Mapping

```typescript
// LEGACY
describe("suite", () => {
  test("case", async ({ page }) => {
    // test body
  });
});

// EFFECT
layer(PlaywrightEnvironment.layer(chromium))("suite", (it) => {
  it.scoped("case",
    Effect.fn(function* () {
      const page = yield* PlaywrightPage;
      // test body
    }, PlaywrightEnvironment.withBrowser)
  );
});
```

---

## Escape Hatches

When Effect wrappers don't cover a Playwright operation:

```typescript
// Use page.use() for raw access
yield* page.use(async (rawPage) => {
  // Raw Playwright Page API available here
  await rawPage.mouse.move(x, y);
  await rawPage.mouse.down();
  await rawPage.mouse.move(x2, y2);
  await rawPage.mouse.up();
});

// Use locator.use() for raw locator access
yield* locator.use(async (rawLocator) => {
  const box = await rawLocator.boundingBox();
  // Work with raw Playwright Locator
});
```

---

## Troubleshooting

### Common Issues

1. **"Service not found" errors**
   - Ensure `PlaywrightEnvironment.layer(chromium)` is provided
   - Verify using `it.scoped()` with `withBrowser` decorator

2. **Timeout errors**
   - Increase timeout in layer options: `layer(..., { timeout: Duration.seconds(60) })`
   - Check if page navigation is completing

3. **Type errors with locators**
   - Remember `page.locator()` returns `PlaywrightLocator.Service`, not raw Locator
   - Use `.use()` to access raw Playwright types when needed

4. **Test isolation issues**
   - Each `it.scoped()` gets fresh browser context
   - State doesn't persist between tests (by design)

---

## Success Checklist

- [ ] `smoke.e2e.ts` migrated and passing
- [ ] `utils/helpers.ts` converted to Effect patterns
- [ ] All 11 describe blocks in `flexlayout.e2e.ts` migrated
- [ ] `bun run test:e2e` passes all tests
- [ ] `bun run check` passes
- [ ] `bun run lint` passes
- [ ] No raw `@playwright/test` imports remain in e2e/
- [ ] REFLECTION_LOG.md updated with learnings
- [ ] Documentation references updated
