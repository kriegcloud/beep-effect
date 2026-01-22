# Meta-Reflection Synthesis: E2E Testkit Migration

Phase 3 Synthesis output consolidating Phase 1-2 learnings into actionable implementation guidance.

**Generated**: 2026-01-22
**Phase**: 3 (Synthesis)
**Input Artifacts**: codebase-context.md, effect-research.md, guideline-review.md, architecture-review.md

---

## Executive Summary

This migration is a **complete rewrite** (0% compliance) from `@playwright/test` to `@beep/testkit/playwright`. Key architectural constraints discovered:

1. **Only `PlaywrightBrowser` is injectable** - Page and Locator are created from it
2. **Mouse operations require escape hatch** - testkit does NOT wrap `page.mouse.*` methods
3. **FlexLayout tests dominate complexity** - 35 of 36 tests, 619 of 827 lines

---

## Universal Learnings

Patterns applicable to any similar Effect-based test migration:

### 1. Service Injection Model

| What | Injectable? | How to Access |
|------|-------------|---------------|
| Browser | YES | `yield* PlaywrightBrowser` |
| Page | NO | `yield* browser.newPage()` |
| Locator | NO | `page.locator(selector)` |
| Context | NO | `yield* browser.newContext()` |

**Pattern**: Only top-level resource providers are injectable. Child resources are created from parents.

### 2. Test Structure Pattern

```typescript
import { describe } from "bun:test";
import { layer, assert } from "@beep/testkit";
import { isPlaywrightAvailable } from "@beep/testkit/playwright";
import { PlaywrightBrowser } from "@beep/testkit/playwright/browser";
import { PlaywrightEnvironment } from "@beep/testkit/playwright/experimental";
import * as Effect from "effect/Effect";
import { chromium } from "playwright-core";

describe.skipIf(!isPlaywrightAvailable)("Suite Name", () => {
  layer(PlaywrightEnvironment.layer(chromium))((it) => {
    it.scoped(
      "test name",
      Effect.fn(function* () {
        const browser = yield* PlaywrightBrowser;
        const page = yield* browser.newPage();
        yield* page.goto("http://localhost:3001/path");
        // Test assertions
      }, PlaywrightEnvironment.withBrowser)
    );
  });
});
```

### 3. Escape Hatch Usage

**CORRECT** - The `page.use()` escape hatch IS required for:
- All `page.mouse.*` operations (move, down, up, click)
- Any Playwright API not exposed by testkit
- Complex multi-step browser operations

**Phase 2 Review Correction**: The architecture review incorrectly stated mouse operations are Effect-wrapped. Grep search confirms testkit has NO mouse methods in its API.

```typescript
// REQUIRED - Mouse operations need escape hatch
yield* page.use(async (p) => {
  await p.mouse.move(x, y);
  await p.mouse.down();
  await p.mouse.move(x2, y2, { steps: 10 });
  await p.mouse.up();
});

// NOT NEEDED - These ARE Effect-wrapped
yield* page.goto(url);
yield* page.locator(sel).click();
yield* page.evaluate(fn);
```

### 4. Error Handling Pattern

**From**: `throw new Error("message")`
**To**: Typed Effect errors with Schema

```typescript
import * as S from "effect/Schema";
import * as Effect from "effect/Effect";

class BoundingBoxNotFound extends S.TaggedError<BoundingBoxNotFound>()(
  "BoundingBoxNotFound",
  { selector: S.String }
) {}

const getBoundingBox = (locator: PlaywrightLocator.Service) =>
  Effect.gen(function* () {
    const box = yield* locator.boundingBox();
    if (!box) {
      return yield* new BoundingBoxNotFound({ selector: "unknown" });
    }
    return box;
  });
```

### 5. Assertion Migration

| Playwright | @beep/testkit |
|------------|---------------|
| `expect(x).toBe(y)` | `strictEqual(x, y)` |
| `expect(x).toBeTruthy()` | `assert(x, "message")` |
| `expect(x).toHaveCount(n)` | `strictEqual(yield* locator.count, n)` |
| `expect(loc).toBeVisible()` | `assert(yield* locator.isVisible())` |
| `expect(loc).toHaveClass(/x/)` | Via `getAttribute` + regex match |

---

## Spec-Specific Learnings

Patterns unique to this FlexLayout e2e migration:

### 1. Drag Operation Pattern (CRITICAL)

FlexLayout tests heavily use coordinate-based mouse drags. The pattern requires escape hatch:

```typescript
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

    // Mouse operations require escape hatch
    yield* page.use(async (p) => {
      await p.mouse.move(fromPoint.x, fromPoint.y);
      await p.mouse.down();
      await p.mouse.move(toPoint.x, toPoint.y, { steps: 10 });
      await p.mouse.up();
    });
  });
```

### 2. Helper Function Signatures

All 9 helper functions need updated signatures:

| Function | Old Signature | New Signature |
|----------|---------------|---------------|
| `findAllTabSets` | `(page: Page)` | `(page: PlaywrightPage.Service)` |
| `findPath` | `(page: Page, path: string)` | `(page: PlaywrightPage.Service, path: string)` |
| `findTabButton` | `(page: Page, path: string, index: number)` | Same pattern |
| `checkTab` | Returns `Promise<void>` | Returns `Effect<void, Error>` |
| `checkBorderTab` | Returns `Promise<void>` | Returns `Effect<void, Error>` |
| `drag` | Uses raw mouse API | Uses escape hatch pattern |
| `dragToEdge` | Uses raw mouse API | Uses escape hatch pattern |
| `dragSplitter` | Uses raw mouse API | Uses escape hatch pattern |

### 3. Fixture Cleanup

| File | Action | Rationale |
|------|--------|-----------|
| `fixtures/auth.setup.ts` | DELETE | Unused - not in playwright.config.ts |
| `fixtures/base.fixture.ts` | DELETE | Unused - no imports found |

### 4. Anti-Pattern Fixes

| Anti-Pattern | Location | Fix |
|--------------|----------|-----|
| `waitForTimeout(500)` | `flexlayout.e2e.ts:614` | `Effect.retry` with condition |
| Implicit beforeEach | All describe blocks | Extract to Layer or helper |
| Untyped throws | 13 locations | Typed Effect errors |

---

## Validated Conversion Patterns

Verified against `tooling/testkit/test/playwright/page.test.ts`:

### Import Statement Migration

```typescript
// FROM
import { test, expect } from "@playwright/test";

// TO
import { describe } from "bun:test";
import { layer, assert, strictEqual } from "@beep/testkit";
import { isPlaywrightAvailable } from "@beep/testkit/playwright";
import { PlaywrightBrowser } from "@beep/testkit/playwright/browser";
import { PlaywrightEnvironment } from "@beep/testkit/playwright/experimental";
import * as Effect from "effect/Effect";
import { chromium } from "playwright-core";
```

### Test Case Migration

```typescript
// FROM
test("homepage loads", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/.+/);
});

// TO
it.scoped(
  "homepage loads",
  Effect.fn(function* () {
    const browser = yield* PlaywrightBrowser;
    const page = yield* browser.newPage();
    yield* page.goto("http://localhost:3001/");
    const title = yield* page.title;
    assert(title.length > 0, "Title should not be empty");
  }, PlaywrightEnvironment.withBrowser)
);
```

### Locator Operation Migration

```typescript
// FROM
const button = page.locator(".btn");
await button.click();
const text = await button.textContent();

// TO
const button = page.locator(".btn");  // Synchronous - returns Service
yield* button.click();                 // Effect-wrapped action
const text = yield* button.textContent(); // Effect-wrapped query
```

---

## Risk Mitigation Summary

### Critical Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Mouse API not wrapped | All drag tests | Use `page.use()` escape hatch |
| Coordinate precision | Visual test failures | Add viewport size Layer |
| Timing dependencies | Flaky tests | `Effect.retry` with Schedule |

### Medium Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Implicit beforeEach state | Test interdependence | Extract to explicit Layer |
| Type inference complexity | IDE warnings | Explicit type annotations |
| Unknown testkit gaps | Missing API coverage | Document needed enhancements |

### Low Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Migration coexistence | Test runner conflicts | Separate commands |
| Configuration changes | CI/CD updates | Document in HANDOFF |

---

## Phase 4 Preparation

### Implementation Sequence

1. **Delete unused fixtures** (5 minutes)
   ```bash
   rm e2e/fixtures/auth.setup.ts e2e/fixtures/base.fixture.ts
   ```

2. **Migrate smoke.e2e.ts** (30 minutes)
   - Establishes import patterns
   - Validates test infrastructure

3. **Migrate utils/helpers.ts** (2 hours)
   - Critical dependency for FlexLayout
   - 9 functions to convert

4. **Migrate flexlayout.e2e.ts** (4-6 hours)
   - 8 groups by describe block
   - Verify each group before proceeding

### Rollback Strategy

If migration fails:

1. **Immediate**: Git revert to pre-migration commit
2. **Incremental**: Keep old tests alongside new (different test commands)
3. **Partial**: Complete only working groups, isolate failing tests

### Verification Commands

```bash
# After each file migration
bun run check

# After smoke.e2e.ts
bun test e2e/smoke.e2e.ts

# After helpers
bun run check

# After each flexlayout group
bun test e2e/flexlayout.e2e.ts --grep "group name"

# Final verification
bun run test:e2e
bun run lint
```

---

## MASTER_ORCHESTRATION Updates Required

### 1. Correct Escape Hatch Examples

The `drag` example needs correction - mouse operations DO require escape hatch:

```typescript
// WRONG (in current MASTER_ORCHESTRATION)
yield* page.mouse.move(cf.x, cf.y);  // page.mouse doesn't exist

// CORRECT
yield* page.use(async (p) => {
  await p.mouse.move(cf.x, cf.y);
  await p.mouse.down();
  await p.mouse.move(ct.x, ct.y, { steps: 10 });
  await p.mouse.up();
});
```

### 2. Update Import Mapping Table

Add missing imports:
- `chromium` from `playwright-core`
- `isPlaywrightAvailable` for skipIf

### 3. Add Viewport Configuration

FlexLayout tests may need consistent viewport:

```typescript
const page = yield* browser.newPage();
yield* page.use((p) => p.setViewportSize({ width: 1280, height: 720 }));
```

### 4. Document Test Coexistence

During migration:
- Effect tests: `bun test e2e/`
- Playwright tests: `bunx playwright test`

---

## Testkit Enhancement Suggestions

For post-migration consideration:

| Enhancement | Rationale | Priority |
|-------------|-----------|----------|
| Add `page.mouse` wrapper | Common e2e pattern | HIGH |
| Add `page.setViewportSize` | Needed for visual tests | MEDIUM |
| Add `page.waitForSelector` | Not in current API | HIGH |
| Export `PlaywrightError` types | Needed for helper signatures | HIGH |

---

## Summary

Phase 3 synthesis reveals:

1. **Architecture is sound** with one critical correction (mouse escape hatch)
2. **Migration order is validated**: smoke → helpers → flexlayout by group
3. **Risk mitigations are identified** for timing, state, and coordinates
4. **MASTER_ORCHESTRATION needs updates** to correct escape hatch examples
5. **Implementation can proceed** with clear patterns and checklists
