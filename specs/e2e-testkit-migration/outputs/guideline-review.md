# Guideline Compliance Review

Phase 2 Evaluation output documenting compliance scores for e2e tests against Effect patterns.

**Generated**: 2026-01-22
**Agent Used**: code-reviewer

---

## Executive Summary

All e2e test files have **0% compliance** with Effect coding standards. The entire test suite uses `@playwright/test` exclusively with no Effect integration. This is a complete rewrite scenario, not a refactoring effort.

**Overall Score**: 0/40 (CRITICAL - Complete non-compliance)

---

## Compliance Scorecard

| File | Namespace Imports | Error Handling | Resource Mgmt | Test Framework | Total |
|------|-------------------|----------------|---------------|----------------|-------|
| `smoke.e2e.ts` | 0/10 | 0/10 | 0/10 | 0/10 | **0/40** |
| `flexlayout.e2e.ts` | 0/10 | 0/10 | 0/10 | 0/10 | **0/40** |
| `utils/helpers.ts` | 0/10 | 0/10 | 0/10 | 0/10 | **0/40** |
| `fixtures/auth.setup.ts` | 0/10 | 10/10 | 0/10 | 0/10 | **10/40** |
| `fixtures/base.fixture.ts` | 0/10 | 10/10 | 0/10 | 0/10 | **10/40** |

### Score Legend

| Score | Status | Action |
|-------|--------|--------|
| 0-2/10 | CRITICAL | Complete rewrite required |
| 3-5/10 | NEEDS_WORK | Major violations, substantial rework |
| 6-8/10 | PASS | Minor violations, simple fixes |
| 9-10/10 | EXCELLENT | Fully compliant |

---

## Detailed Violations

### 1. Namespace Imports (0/10 across all files)

**Requirement**: Use `import * as Effect from "effect/Effect"` style imports

**Violations**:

| File | Line | Violation |
|------|------|-----------|
| `smoke.e2e.ts` | 1 | `import { test, expect } from "@playwright/test"` |
| `flexlayout.e2e.ts` | 1 | `import { expect, test } from "@playwright/test"` |
| `utils/helpers.ts` | 1 | `import { expect, type Locator, type Page } from "@playwright/test"` |
| `fixtures/auth.setup.ts` | 1 | `import { test as setup, expect } from "@playwright/test"` |
| `fixtures/base.fixture.ts` | 1 | `import { test as base, expect } from "@playwright/test"` |

**Required Pattern**:
```typescript
import * as Effect from "effect/Effect";
import { layer, scoped, assert } from "@beep/testkit";
import { PlaywrightEnvironment } from "@beep/testkit/playwright/experimental";
```

---

### 2. Error Handling (0/10 for test files, 10/10 for fixtures)

**Requirement**: Use Effect error channels with typed errors

**Violations (13 total)**:

| File | Line | Violation |
|------|------|-----------|
| `flexlayout.e2e.ts` | 240 | `throw new Error("Could not get bounding boxes")` |
| `flexlayout.e2e.ts` | 249 | `throw new Error("Could not get final bounding boxes")` |
| `flexlayout.e2e.ts` | 263 | `throw new Error("Could not get bounding boxes")` |
| `flexlayout.e2e.ts` | 271 | `throw new Error("Could not get final bounding boxes")` |
| `flexlayout.e2e.ts` | 303 | `throw new Error("Could not get bounding boxes")` |
| `flexlayout.e2e.ts` | 311 | `throw new Error("Could not get final bounding boxes")` |
| `flexlayout.e2e.ts` | 503 | `throw new Error("Could not get tab bounding box")` |
| `flexlayout.e2e.ts` | 527 | `throw new Error("Could not get bounding boxes")` |
| `flexlayout.e2e.ts` | 558 | `throw new Error("Could not get tab bounding box")` |
| `utils/helpers.ts` | 98 | `throw new Error("Unknown location: ${loc}")` |
| `utils/helpers.ts` | 111 | `throw new Error("Could not get bounding boxes")` |
| `utils/helpers.ts` | 128 | `throw new Error("Could not get bounding box for source")` |
| `utils/helpers.ts` | 138 | `throw new Error("Could not get bounding box for edge")` |
| `utils/helpers.ts` | 153 | `throw new Error("Could not get bounding box for splitter")` |

**Required Pattern**:
```typescript
class BoundingBoxNotFound extends S.TaggedError<BoundingBoxNotFound>()(
  "BoundingBoxNotFound",
  { element: S.String }
) {}

const getBox = (locator: Locator) =>
  Effect.gen(function* () {
    const box = yield* Effect.tryPromise(() => locator.boundingBox());
    if (!box) return yield* new BoundingBoxNotFound({ element: "tabset" });
    return box;
  });
```

---

### 3. Resource Management (0/10 across all files)

**Requirement**: Use Effect Scope with acquireRelease for browser lifecycle

**Violations**: All test files use unmanaged async/await patterns

| File | Count | Lines |
|------|-------|-------|
| `smoke.e2e.ts` | 1 | Line 4: `async ({ page }) =>` |
| `flexlayout.e2e.ts` | 47 | Lines 21, 26, 41, 57, ... (all test functions) |
| `utils/helpers.ts` | 5 | Lines 15, 41, 102, 122, 146 |
| `fixtures/auth.setup.ts` | 1 | Line 5: `async ({ page }) =>` |
| `fixtures/base.fixture.ts` | 0 | No async code |

**Problems**:
1. No Scope tracking for browser/page lifecycle
2. No acquireRelease for cleanup guarantees
3. Manual resource management (error-prone)
4. No Effect interruption support

**Required Pattern**:
```typescript
layer(PlaywrightEnvironment.layer(chromium))((it) => {
  it.scoped("test name", Effect.fn(function* () {
    const browser = yield* PlaywrightBrowser;
    const page = yield* browser.newPage();
    // Scope automatically tracks and releases page
    yield* page.goto("...");
  }, PlaywrightEnvironment.withBrowser));
});
```

---

### 4. Testing Framework (0/10 across all files)

**Requirement**: Use `@beep/testkit` with `effect()`, `scoped()`, `layer()`

**Violations**: All files use `@playwright/test`

| File | Pattern | Count |
|------|---------|-------|
| `smoke.e2e.ts` | `test.describe()`, `test()` | 2 |
| `flexlayout.e2e.ts` | `test.describe()`, `test()`, `test.beforeEach()`, `test.use()` | 61 |
| `utils/helpers.ts` | N/A (utility file) | 0 |
| `fixtures/auth.setup.ts` | `test as setup` | 1 |
| `fixtures/base.fixture.ts` | `test as base` | 1 |

**Required Pattern**:
```typescript
import { describe } from "bun:test";
import { layer, assert } from "@beep/testkit";

describe("Nested Layouts", () => {
  layer(PlaywrightEnvironment.layer(chromium))((it) => {
    it.scoped("test name", Effect.fn(function* () {
      // Test logic using Effect.gen
    }, PlaywrightEnvironment.withBrowser));
  });
});
```

---

## Anti-Patterns Detected

### 1. Fixed Timeout (MEDIUM severity)

| File | Line | Code |
|------|------|------|
| `flexlayout.e2e.ts` | 614 | `await page.waitForTimeout(500)` |

**Problem**: Non-deterministic timing creates flaky tests.

**Fix**: Use condition-based waiting with Effect retry:
```typescript
yield* Effect.retry(
  checkLayoutReloaded(page),
  Schedule.spaced(Duration.millis(100)).pipe(
    Schedule.upTo(Duration.seconds(2))
  )
);
```

---

## Most Critical Violations

1. **No Effect integration** - Complete absence of Effect patterns
2. **Untyped error handling** - 13 `throw new Error()` statements
3. **No resource management** - Browser lifecycle not tracked
4. **Wrong test framework** - Using @playwright/test instead of @beep/testkit

---

## Recommended Migration Order

1. **smoke.e2e.ts** - Validate approach (simplest file)
2. **utils/helpers.ts** - Required by flexlayout tests
3. **flexlayout.e2e.ts** - Migrate by describe block
4. **fixtures/** - Delete (both files are unused)

---

## Questions Answered

### Q1: What is the recommended migration order?
1. smoke.e2e.ts (1 test, 8 lines) - pilot migration
2. utils/helpers.ts (9 functions) - dependency for flexlayout
3. flexlayout.e2e.ts by describe block (35 tests)
4. Delete unused fixtures

### Q2: Are there any blocking issues?
- No blockers. All files can be migrated incrementally.
- Unused fixtures can be deleted immediately.

### Q3: Can old and new tests coexist during migration?
- Yes. Effect tests use `bun:test`, Playwright tests use `@playwright/test`.
- Different test runners can coexist in the same `e2e/` folder.
- Recommend separate test commands during migration.
