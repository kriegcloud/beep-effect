# Architecture Validation Review

Phase 2 Evaluation output validating the proposed migration architecture.

**Generated**: 2026-01-22
**Agent Used**: architecture-pattern-enforcer

---

## Executive Summary

The proposed architecture has **significant flaws** requiring fundamental revision. While the layer-based approach is correct, the service injection patterns and helper function design misunderstand the testkit API. Key corrections are needed before implementation.

**Overall Assessment**: NOT READY FOR IMPLEMENTATION

---

## Validation Results

| Aspect | Status | Notes |
|--------|--------|-------|
| Layer Creation | PARTIAL | Entry point correct, usage incomplete |
| Service Injection | FAILED | Incorrect assumptions about injectable services |
| Test Isolation | PASS | `it.scoped()` correctly handles resources |
| Helper Functions | FAILED | Signature design incompatible with API |

---

## 1. Layer Creation Correctness

### Status: PARTIAL

**What's Correct**:
```typescript
// Entry point is correct
layer(PlaywrightEnvironment.layer(chromium))((it) => { ... });
```

**Critical Issue**: The proposed examples omit `Effect.fn` wrapper details.

**Correct Pattern** (from testkit reference):
```typescript
it.scoped(
  "test name",
  Effect.fn(function* () {
    const browser = yield* PlaywrightBrowser;  // Inject browser
    const page = yield* browser.newPage();     // Create page from browser
    yield* page.goto("about:blank");
    const url = yield* page.use((p) => Promise.resolve(p.url()));
    assert(url === "about:blank");
  }, PlaywrightEnvironment.withBrowser)  // Decorator provides browser
);
```

**Key Points**:
- Use `Effect.fn(function* () { ... }, decorator)` pattern
- `withBrowser` decorator handles browser lifecycle
- Browser type configured via `PlaywrightEnvironment.layer(chromium)`

---

## 2. Service Injection Patterns

### Status: FAILED

**Critical Discovery**: The proposed service tags do NOT exist as injectable services.

| Service Tag | Proposed | Actual |
|-------------|----------|--------|
| `PlaywrightBrowser` | Injectable | **Injectable** |
| `PlaywrightPage` | Injectable | **NOT injectable** (created from browser) |
| `PlaywrightLocator` | Injectable | **NOT injectable** (created from page) |

**Correct Service Architecture**:

```typescript
// ONLY PlaywrightBrowser is injectable
export class PlaywrightBrowser extends Context.Tag("PlaywrightBrowser")<
  PlaywrightBrowser,
  {
    readonly browser: Browser;
    readonly newPage: () => Effect.Effect<PlaywrightPage.Service, PlaywrightError>;
    readonly newContext: (options?) => Effect.Effect<PlaywrightBrowserContext.Service, PlaywrightError>;
  }
>() {}
```

**Correct Usage**:
```typescript
// 1. Inject browser (ONLY injectable service)
const browser = yield* PlaywrightBrowser;

// 2. Create page from browser (NOT injected)
const page = yield* browser.newPage();

// 3. Create locators from page (NOT injected)
const button = page.locator("button");

// 4. Use locator methods
yield* button.click();
```

**Key Insight**: `PlaywrightPage` and `PlaywrightLocator` are **service interfaces**, not injectable tags. They are created through method calls, not Context injection.

---

## 3. Test Isolation

### Status: PASS

The `it.scoped()` pattern correctly handles resource isolation.

**Why It Works**:
- `it.scoped()` uses Effect's Scope mechanism
- Browser contexts are tied to test scope
- Pages created via `browser.newPage()` are automatically cleaned up
- Parallel test execution is safe (isolated browser contexts)

**Recommendation**: Use `it.scoped()` as proposed. Pattern is correct.

---

## 4. Helper Function Approach

### Status: FAILED

The proposed helper migration strategy misunderstands the service model.

**Proposed (INCORRECT)**:
```typescript
export const drag = (
  page: PlaywrightPage.Service,        // Passed as parameter
  from: PlaywrightLocator.Service,     // Passed as parameter
  to: PlaywrightLocator.Service,       // Passed as parameter
  loc: LocationValue
) => Effect.gen(function* () {
  const fr = yield* from.use((l) => l.boundingBox());  // WRONG API
  // ...
});
```

**Correct Pattern**:
```typescript
export const drag = (
  page: PlaywrightPage.Service,  // Service instance, not tag
  fromSelector: string,           // Use selectors, not pre-created locators
  toSelector: string,
  loc: LocationValue
): Effect.Effect<void, PlaywrightError> =>
  Effect.gen(function* () {
    // Create locators from selectors
    const from = page.locator(fromSelector);
    const to = page.locator(toSelector);

    // Use Effect-wrapped methods (no escape hatch needed)
    const frBox = yield* from.boundingBox();
    if (!frBox) {
      return yield* Effect.fail(new PlaywrightError({
        message: "Source element has no bounding box"
      }));
    }

    const toBox = yield* to.boundingBox();
    if (!toBox) {
      return yield* Effect.fail(new PlaywrightError({
        message: "Target element has no bounding box"
      }));
    }

    // Calculate positions
    const cf = calculatePoint(frBox, Location.CENTER);
    const ct = calculatePoint(toBox, loc);

    // Use page mouse methods (already Effect-wrapped)
    yield* page.mouse.move(cf.x, cf.y);
    yield* page.mouse.down();
    yield* page.mouse.move(ct.x, ct.y);
    yield* page.mouse.up();
  });
```

**Key Corrections**:
1. Accept `PlaywrightPage.Service` directly (already Effect-wrapped)
2. Use selectors instead of pre-created locators
3. All Playwright operations return Effects - no need for `use()` escape hatch
4. Error handling via `Effect.fail` with proper error types

---

## When to Use `page.use()` Escape Hatch

The `use()` pattern is only necessary for operations **not wrapped** by testkit.

**Escape hatch IS needed**:
```typescript
// Raw Playwright API not wrapped by testkit
yield* page.use(async (p) => {
  const pdf = await p.pdf({ format: 'A4' });
  return pdf;
});
```

**Escape hatch NOT needed**:
```typescript
// These are already Effect-wrapped
yield* page.goto("...");
yield* page.locator(".btn").click();
yield* page.evaluate(() => document.title);
```

---

## Critical Issues Summary

| Issue | Severity | Impact |
|-------|----------|--------|
| Missing service tags for Page/Locator | **CRITICAL** | Architecture won't compile |
| Helper function parameter types | **CRITICAL** | Type errors, runtime failures |
| Misuse of `use()` escape hatch | **HIGH** | Unnecessary Promise wrapping |
| `Effect.fn` pattern incomplete | **MEDIUM** | Tests won't execute correctly |

---

## Corrected Architecture

### Test Structure
```typescript
import { describe } from "bun:test";
import { layer, assert } from "@beep/testkit";
import { PlaywrightBrowser } from "@beep/testkit/playwright/browser";
import { PlaywrightEnvironment } from "@beep/testkit/playwright/experimental";
import { chromium } from "playwright-core";
import * as Effect from "effect/Effect";
import { drag } from "./helpers";

describe("FlexLayout Drag Tests", () => {
  layer(PlaywrightEnvironment.layer(chromium))((it) => {
    it.scoped(
      "drag tab One to right of Two",
      Effect.fn(function* () {
        // 1. Inject browser (ONLY injectable service)
        const browser = yield* PlaywrightBrowser;

        // 2. Create page (NOT injected)
        const page = yield* browser.newPage();

        // 3. Navigate
        yield* page.goto("http://localhost:3001/demo?layout=test_two_tabs");

        // 4. Wait for layout
        yield* page.waitForSelector(".flexlayout__layout");

        // 5. Use helper (pass page service + selectors)
        yield* drag(page, "[data-layout-path='/ts0/tb0']", "[data-layout-path='/ts1']", Location.RIGHT);

        // 6. Assert
        const tabsets = yield* page.locator(".flexlayout__tabset").count;
        assert(tabsets === 2);
      }, PlaywrightEnvironment.withBrowser)
    );
  });
});
```

### Helper Function Structure
```typescript
// e2e/utils/helpers.ts
import type { PlaywrightPage } from "@beep/testkit/playwright/page";
import type { PlaywrightError } from "@beep/testkit/playwright/errors";
import * as Effect from "effect/Effect";

export interface LocationValue {
  readonly x: number;
  readonly y: number;
}

export const Location = {
  CENTER: { x: 0.5, y: 0.5 },
  TOP: { x: 0.5, y: 0.1 },
  BOTTOM: { x: 0.5, y: 0.9 },
  LEFT: { x: 0.1, y: 0.5 },
  RIGHT: { x: 0.9, y: 0.5 },
} as const;

export const drag = (
  page: PlaywrightPage.Service,
  fromSelector: string,
  toSelector: string,
  loc: LocationValue
): Effect.Effect<void, PlaywrightError> =>
  Effect.gen(function* () {
    const from = page.locator(fromSelector);
    const to = page.locator(toSelector);

    const frBox = yield* from.boundingBox();
    if (!frBox) {
      return yield* Effect.fail(
        new PlaywrightError({ message: `Source element not found: ${fromSelector}` })
      );
    }

    const toBox = yield* to.boundingBox();
    if (!toBox) {
      return yield* Effect.fail(
        new PlaywrightError({ message: `Target element not found: ${toSelector}` })
      );
    }

    const fromPoint = {
      x: frBox.x + frBox.width * 0.5,
      y: frBox.y + frBox.height * 0.5,
    };
    const toPoint = {
      x: toBox.x + toBox.width * loc.x,
      y: toBox.y + toBox.height * loc.y,
    };

    yield* page.mouse.move(fromPoint.x, fromPoint.y);
    yield* page.mouse.down();
    yield* page.mouse.move(toPoint.x, toPoint.y, { steps: 10 });
    yield* page.mouse.up();
  });
```

---

## Service Tag Reference

```typescript
// ONLY these are injectable via Context.Tag:
PlaywrightBrowser  // Available - inject in tests

// These are NOT injectable (created from browser/page):
PlaywrightPage     // Created via browser.newPage()
PlaywrightLocator  // Created via page.locator()
```

---

## Blockers Identified

1. **Architecture Misunderstanding**: Proposal assumes Page and Locator are injectable services. Requires fundamental redesign.

2. **Helper Function Contracts**: All helpers must be rewritten to accept Effect-wrapped services directly, not inject them.

3. **Escape Hatch Overuse**: `use()` pattern proposed for operations already Effect-wrapped.

---

## Recommendations

### Before Implementation

1. Revise service injection to only use `PlaywrightBrowser`
2. Rewrite all helpers to accept `PlaywrightPage.Service` directly
3. Remove unnecessary `use()` escape hatches
4. Update test structure to use `Effect.fn` decorator pattern

### Estimated Rework

- **Scope**: Medium (2-3 days)
- **Impact**: Helper functions and test structure
- **Risk**: Low (patterns validated against testkit reference)

---

## Questions Answered

### Q3: What patterns should be used for complex drag operations?
```typescript
export const drag = (
  page: PlaywrightPage.Service,
  fromSelector: string,
  toSelector: string,
  loc: LocationValue
): Effect.Effect<void, PlaywrightError> =>
  Effect.gen(function* () {
    // Use selectors to create locators
    const from = page.locator(fromSelector);
    const to = page.locator(toSelector);

    // All operations are Effect-wrapped
    const frBox = yield* from.boundingBox();
    // ... coordinate calculations ...
    yield* page.mouse.move(x, y);
    yield* page.mouse.down();
    yield* page.mouse.move(x2, y2);
    yield* page.mouse.up();
  });
```

### Q4: How should authentication fixtures be handled?
- Current fixtures are **unused** and should be deleted
- If auth is needed later, create as Effect Layer:
```typescript
const AuthLayer = Layer.effect(
  AuthContext,
  Effect.gen(function* () {
    const page = yield* browser.newPage();
    yield* page.goto("/login");
    yield* page.fill("#email", "test@example.com");
    yield* page.fill("#password", "password");
    yield* page.click("button[type=submit]");
    return { authenticated: true };
  })
);
```

### Q5: Can old and new tests coexist during migration?
- **Yes**. Effect tests use `bun:test`, Playwright tests use `@playwright/test`.
- Different test runners can coexist in same folder.
- Run separately: `bun test` vs `bunx playwright test`
