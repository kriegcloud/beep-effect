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

// AFTER (~25 lines)
import { describe } from "bun:test";
import { layer, assert } from "@beep/testkit";
import { isPlaywrightAvailable } from "@beep/testkit/playwright";
import { PlaywrightBrowser } from "@beep/testkit/playwright/browser";
import { PlaywrightEnvironment } from "@beep/testkit/playwright/experimental";
import * as Effect from "effect/Effect";
import { chromium } from "playwright-core";

describe.skipIf(!isPlaywrightAvailable)("Smoke Tests", () => {
  layer(PlaywrightEnvironment.layer(chromium))((it) => {
    it.scoped(
      "homepage loads",
      Effect.fn(function* () {
        // ONLY PlaywrightBrowser is injectable - Page is created from it
        const browser = yield* PlaywrightBrowser;
        const page = yield* browser.newPage();
        yield* page.goto("http://localhost:3000");
        const title = yield* page.title;
        assert(title.length > 0, "Title should not be empty");
      }, PlaywrightEnvironment.withBrowser)
    );
  });
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

// AFTER - Effect-wrapped drag with escape hatch for mouse
// NOTE: page.mouse is NOT wrapped by testkit - escape hatch IS required
export const drag = (
  page: PlaywrightPage.Service,
  fromSelector: string,
  toSelector: string,
  loc: LocationValue
): Effect.Effect<void, PlaywrightError.Type | BoundingBoxNotFound> =>
  Effect.gen(function* () {
    const from = page.locator(fromSelector);
    const to = page.locator(toSelector);

    // Get bounding boxes (Effect-wrapped)
    const frBox = yield* from.boundingBox();
    if (!frBox) return yield* new BoundingBoxNotFound({ selector: fromSelector });

    const toBox = yield* to.boundingBox();
    if (!toBox) return yield* new BoundingBoxNotFound({ selector: toSelector });

    // Calculate coordinates
    const fromPoint = { x: frBox.x + frBox.width * 0.5, y: frBox.y + frBox.height * 0.5 };
    const toPoint = { x: toBox.x + toBox.width * loc.x, y: toBox.y + toBox.height * loc.y };

    // Mouse operations REQUIRE escape hatch - testkit does not wrap page.mouse
    yield* page.use(async (p) => {
      await p.mouse.move(fromPoint.x, fromPoint.y);
      await p.mouse.down();
      await p.mouse.move(toPoint.x, toPoint.y, { steps: 10 });
      await p.mouse.up();
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
| `import { Page } from "@playwright/test"` | `import type { PlaywrightPage } from "@beep/testkit/playwright/page"` |
| `import { Locator } from "@playwright/test"` | `import type { PlaywrightLocator } from "@beep/testkit/playwright/locator"` |
| N/A | `import { describe } from "bun:test"` |
| N/A | `import { isPlaywrightAvailable } from "@beep/testkit/playwright"` |
| N/A | `import { PlaywrightBrowser } from "@beep/testkit/playwright/browser"` |
| N/A | `import { PlaywrightEnvironment } from "@beep/testkit/playwright/experimental"` |
| N/A | `import { chromium } from "playwright-core"` |
| N/A | `import * as Effect from "effect/Effect"` |

### Full Import Block (Copy-Paste Ready)

```typescript
import { describe } from "bun:test";
import { layer, assert, strictEqual } from "@beep/testkit";
import { isPlaywrightAvailable } from "@beep/testkit/playwright";
import { PlaywrightBrowser } from "@beep/testkit/playwright/browser";
import { PlaywrightEnvironment } from "@beep/testkit/playwright/experimental";
import type { PlaywrightPage } from "@beep/testkit/playwright/page";
import type { PlaywrightLocator } from "@beep/testkit/playwright/locator";
import * as Effect from "effect/Effect";
import { chromium } from "playwright-core";
```

### Async Operation Mapping

| Legacy | Effect | Notes |
|--------|--------|-------|
| `await page.goto(url)` | `yield* page.goto(url)` | Wrapped |
| `await page.click(sel)` | `yield* page.locator(sel).click()` | Wrapped |
| `await page.fill(sel, val)` | `yield* page.locator(sel).fill(val)` | Wrapped |
| `await locator.textContent()` | `yield* locator.textContent()` | Wrapped |
| `await locator.boundingBox()` | `yield* locator.boundingBox()` | Wrapped |
| `await locator.isVisible()` | `yield* locator.isVisible()` | Wrapped |
| `await page.evaluate(fn)` | `yield* page.evaluate(fn)` | Wrapped |
| `await page.title()` | `yield* page.title` | Property-style |
| `await page.url()` | `yield* page.url` | Property-style |
| `await page.mouse.move(x, y)` | `yield* page.use((p) => p.mouse.move(x, y))` | **Escape hatch** |
| `await page.mouse.down()` | `yield* page.use((p) => p.mouse.down())` | **Escape hatch** |
| `await page.mouse.up()` | `yield* page.use((p) => p.mouse.up())` | **Escape hatch** |
| `await page.waitForSelector(s)` | `yield* page.use((p) => p.waitForSelector(s))` | **Escape hatch** |
| `await page.waitForTimeout(ms)` | `yield* Effect.sleep(Duration.millis(ms))` | Use Effect |
| `page.on('dialog', fn)` | `page.eventStream("dialog")` | Stream-based |

### Assertion Mapping

| Legacy | Effect |
|--------|--------|
| `expect(value).toBe(expected)` | `strictEqual(value, expected)` |
| `expect(value).toBeTruthy()` | `assert(value, "message")` |
| `expect(locator).toBeVisible()` | `yield* locator.use(l => expect(l).toBeVisible())` |

### Test Structure Mapping

```typescript
// LEGACY
import { test, expect } from "@playwright/test";

test.describe("suite", () => {
  test("case", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/.+/);
  });
});

// EFFECT
import { describe } from "bun:test";
import { layer, assert } from "@beep/testkit";
import { isPlaywrightAvailable } from "@beep/testkit/playwright";
import { PlaywrightBrowser } from "@beep/testkit/playwright/browser";
import { PlaywrightEnvironment } from "@beep/testkit/playwright/experimental";
import * as Effect from "effect/Effect";
import { chromium } from "playwright-core";

describe.skipIf(!isPlaywrightAvailable)("suite", () => {
  layer(PlaywrightEnvironment.layer(chromium))((it) => {
    it.scoped(
      "case",
      Effect.fn(function* () {
        // CRITICAL: Only PlaywrightBrowser is injectable
        const browser = yield* PlaywrightBrowser;
        const page = yield* browser.newPage();
        yield* page.goto("http://localhost:3000/");
        const title = yield* page.title;
        assert(title.length > 0);
      }, PlaywrightEnvironment.withBrowser)
    );
  });
});
```

### beforeEach Migration

```typescript
// LEGACY
test.describe("group", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/demo?layout=test");
    await page.waitForSelector(".flexlayout__layout");
  });

  test("test 1", async ({ page }) => { ... });
});

// EFFECT - Extract to helper function called at start of each test
const setupPage = (page: PlaywrightPage.Service, layout: string) =>
  Effect.gen(function* () {
    yield* page.goto(`http://localhost:3001/demo?layout=${layout}`);
    yield* page.use((p) => p.waitForSelector(".flexlayout__layout"));
  });

describe.skipIf(!isPlaywrightAvailable)("group", () => {
  layer(PlaywrightEnvironment.layer(chromium))((it) => {
    it.scoped(
      "test 1",
      Effect.fn(function* () {
        const browser = yield* PlaywrightBrowser;
        const page = yield* browser.newPage();
        yield* setupPage(page, "test");
        // ... test body
      }, PlaywrightEnvironment.withBrowser)
    );
  });
});
```

---

## Escape Hatches

The testkit wraps most Playwright operations, but some require escape hatch for raw access:

### MUST Use Escape Hatch

These APIs are NOT wrapped by testkit:

```typescript
// page.mouse.* operations - ALWAYS need escape hatch
yield* page.use(async (rawPage) => {
  await rawPage.mouse.move(x, y);
  await rawPage.mouse.down();
  await rawPage.mouse.move(x2, y2, { steps: 10 });
  await rawPage.mouse.up();
});

// page.setViewportSize - for consistent viewport
yield* page.use(async (rawPage) => {
  await rawPage.setViewportSize({ width: 1280, height: 720 });
});

// page.waitForSelector - not in current testkit API
yield* page.use(async (rawPage) => {
  await rawPage.waitForSelector(".flexlayout__layout");
});
```

### Already Effect-Wrapped (NO escape hatch needed)

```typescript
// Navigation
yield* page.goto(url);
yield* page.reload;

// Locator actions
yield* page.locator(".btn").click();
yield* page.locator("input").fill("text");

// Queries
const title = yield* page.title;
const url = yield* page.url;
const text = yield* locator.textContent();
const visible = yield* locator.isVisible();
const box = yield* locator.boundingBox();

// Evaluation
yield* page.evaluate(() => document.title);
```

---

## Troubleshooting

### Common Issues

1. **"Service not found" errors**
   - Ensure `PlaywrightEnvironment.layer(chromium)` is provided
   - Verify using `it.scoped()` with `withBrowser` decorator
   - **CRITICAL**: Only `PlaywrightBrowser` is injectable. Use `browser.newPage()` for pages.

2. **"page.mouse is not a function" / "page.mouse undefined"**
   - **testkit does NOT wrap `page.mouse`** - use escape hatch:
   ```typescript
   yield* page.use(async (p) => {
     await p.mouse.move(x, y);
     await p.mouse.down();
     // ...
   });
   ```

3. **"page.waitForSelector is not a function"**
   - testkit does NOT wrap `waitForSelector` - use escape hatch:
   ```typescript
   yield* page.use((p) => p.waitForSelector(".selector"));
   ```

4. **Timeout errors**
   - Increase timeout in layer options: `layer(..., { timeout: Duration.seconds(60) })`
   - Check if page navigation is completing
   - For retry logic, use `Effect.retry` with Schedule

5. **Type errors with locators**
   - Remember `page.locator()` returns `PlaywrightLocator.Service`, not raw Locator
   - Use `.use()` to access raw Playwright types when needed

6. **Test isolation issues**
   - Each `it.scoped()` gets fresh browser context
   - State doesn't persist between tests (by design)

7. **TypeError: Cannot read properties of undefined (reading 'Service')**
   - Wrong import path. Use:
     - `@beep/testkit/playwright/browser` for `PlaywrightBrowser`
     - `@beep/testkit/playwright/page` for `PlaywrightPage` type
     - `@beep/testkit/playwright/experimental` for `PlaywrightEnvironment`

---

## Implementation Checklists

### Phase 4.0: Cleanup (5 minutes)

```bash
rm e2e/fixtures/auth.setup.ts e2e/fixtures/base.fixture.ts
```

- [ ] Delete `e2e/fixtures/auth.setup.ts` (unused)
- [ ] Delete `e2e/fixtures/base.fixture.ts` (unused)
- [ ] Verify: `ls e2e/fixtures/` should be empty or folder deleted

### Phase 4.1: smoke.e2e.ts (30 minutes)

| Step | Task | Verification |
|------|------|--------------|
| 1 | Replace imports | No `@playwright/test` import |
| 2 | Add `describe.skipIf(!isPlaywrightAvailable)` | Syntax check |
| 3 | Wrap with `layer(PlaywrightEnvironment.layer(chromium))` | Syntax check |
| 4 | Convert `test()` to `it.scoped()` with `Effect.fn` | Type check |
| 5 | Use `yield* PlaywrightBrowser` + `browser.newPage()` | Type check |
| 6 | Replace `expect().toHaveTitle()` with `assert()` | Type check |
| 7 | Run test | `bun test e2e/smoke.e2e.ts` |

### Phase 4.2: utils/helpers.ts (2 hours)

**9 functions + 1 constant + 1 type to migrate:**

| Function | Complexity | Pattern | Verification |
|----------|------------|---------|--------------|
| `findAllTabSets` | Simple | Return locator service | Type check |
| `findPath` | Simple | Return locator service | Type check |
| `findTabButton` | Simple | Uses `findPath` | Type check |
| `checkTab` | Medium | Effect + assertions | Type check |
| `checkBorderTab` | Medium | Effect + assertions | Type check |
| `getLocation` | Simple | Pure (no change needed) | None |
| `drag` | Complex | Escape hatch for mouse | Type check |
| `dragToEdge` | Complex | Escape hatch for mouse | Type check |
| `dragSplitter` | Complex | Escape hatch for mouse | Type check |
| `Location` | Simple | Const (no change) | None |
| `LocationValue` | Simple | Type (no change) | None |

**Checklist:**

- [ ] Update imports to Effect + testkit types
- [ ] `findAllTabSets(page: PlaywrightPage.Service)` - returns locator
- [ ] `findPath(page: PlaywrightPage.Service, path: string)` - returns locator
- [ ] `findTabButton(...)` - uses `findPath`, returns locator
- [ ] `checkTab(...)` - returns `Effect<void, Error>`
- [ ] `checkBorderTab(...)` - returns `Effect<void, Error>`
- [ ] `drag(...)` - uses `page.use()` escape hatch for mouse
- [ ] `dragToEdge(...)` - uses `page.use()` escape hatch
- [ ] `dragSplitter(...)` - uses `page.use()` escape hatch
- [ ] Verify: `bun run check`

### Phase 4.3: flexlayout.e2e.ts (4-6 hours)

**12 describe blocks, 32 tests total:**

| Group | Tests | Complexity | Helpers Used |
|-------|-------|------------|--------------|
| 1. drag tests (test_two_tabs) | 6 | Medium | drag, dragToEdge, checkTab |
| 2. three tabs tests | 4 | Medium | drag, checkTab |
| 3. border tests | 5 | Medium | drag, checkTab, checkBorderTab |
| 4. splitter tests | 2 | High | dragSplitter |
| 5. vertical splitter tests | 1 | High | drag, dragSplitter |
| 6. add tab tests | 3 | Low | click, locator |
| 7. close tab tests | 1 | Low | click, locator |
| 8. tab selection tests | 3 | Low | click, locator |
| 9. maximize tests | 2 | Low | dblclick, locator |
| 10. drag rect tests | 2 | Medium | mouse escape hatch |
| 11. edge rect tests | 1 | Medium | mouse escape hatch |
| 12. layout persistence | 2 | Low | drag, reload |

**Migration Order (by dependency):**

1. **Group 6-9** (add/close/selection/maximize) - No drag helpers, simplest
2. **Group 12** (persistence) - Uses drag but simple
3. **Group 1-3** (drag/tabs/border) - Core drag tests
4. **Group 4-5** (splitters) - Splitter-specific
5. **Group 10-11** (drag/edge rects) - Raw mouse operations

**Per-Group Checklist Template:**

- [ ] Replace `test.beforeEach` with helper function
- [ ] Convert `test()` calls to `it.scoped()` with `Effect.fn`
- [ ] Replace `await` with `yield*`
- [ ] Replace `expect()` with `assert()` / `strictEqual()`
- [ ] Verify: `bun test e2e/flexlayout.e2e.ts --grep "group name"`

---

## Success Checklist

- [ ] Unused fixtures deleted
- [ ] `smoke.e2e.ts` migrated and passing
- [ ] `utils/helpers.ts` converted to Effect patterns
- [ ] All 12 describe blocks in `flexlayout.e2e.ts` migrated
- [ ] `bun run test:e2e` passes all tests
- [ ] `bun run check` passes
- [ ] `bun run lint` passes
- [ ] No raw `@playwright/test` imports remain in e2e/
- [ ] REFLECTION_LOG.md updated with learnings
- [ ] Documentation references updated
