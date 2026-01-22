# E2E Codebase Context

Phase 1 Discovery output combining test inventory, dependency analysis, and pattern extraction.

**Generated**: 2026-01-22
**Agents Used**: codebase-researcher (3 parallel tasks)

---

## Executive Summary

The `./e2e` folder contains 6 TypeScript files totaling ~827 lines with 36 tests across 2 test files. The primary complexity lies in `flexlayout.e2e.ts` (619 lines, 35 tests) which uses custom drag/drop helpers for FlexLayout UI testing. All tests use `@playwright/test` exclusively with no existing Effect integration. Migration should start with the simple `smoke.e2e.ts`, then migrate helpers, then tackle `flexlayout.e2e.ts` incrementally.

---

## Test Inventory

### File Summary

| File | Lines | Test Count | Describe Blocks | Complexity | Migration Priority |
|------|-------|------------|-----------------|------------|-------------------|
| `smoke.e2e.ts` | 8 | 1 | 1 | Simple | 1 (start here) |
| `flexlayout.e2e.ts` | 619 | 35 | 14 | Complex | 3 (after helpers) |
| `utils/helpers.ts` | 165 | N/A | N/A | Medium | 2 (before flexlayout) |
| `utils/index.ts` | 12 | N/A | N/A | Simple | 2 (with helpers) |
| `fixtures/auth.setup.ts` | 19 | 1 setup | 0 | Simple | 4 (optional - unused) |
| `fixtures/base.fixture.ts` | 4 | N/A | N/A | Simple | 5 (remove - unused) |

### Totals

| Category | Count |
|----------|-------|
| Total files | 6 |
| Test files | 2 |
| Utility files | 2 |
| Fixture files | 2 |
| Total tests | 36 |
| Total describe blocks | 15 |
| Total lines | 827 |

### Detailed File Analysis

#### 1. `e2e/smoke.e2e.ts` (8 lines)

**Purpose**: Basic smoke test to verify homepage loads

**Structure**:
```typescript
import { test, expect } from "@playwright/test";

test.describe("Smoke Tests", () => {
  test("homepage loads", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/.+/);
  });
});
```

**Migration Notes**: Direct 1:1 translation possible. Ideal first migration target.

#### 2. `e2e/flexlayout.e2e.ts` (619 lines)

**Purpose**: Comprehensive FlexLayout component testing including drag-drop, splitters, borders, tabs, and layout persistence.

**Configuration**:
```typescript
test.use({ baseURL: "http://localhost:3001" });
```

**Describe Blocks (14 total)**:
1. `drag tests (test_two_tabs)` - 7 tests
2. `three tabs tests (test_three_tabs)` - 4 tests
3. `border tests (test_with_borders)` - 5 tests
4. `splitter tests` - 2 tests
5. `vertical splitter tests` - 1 test
6. `add tab tests` - 3 tests
7. `close tab tests` - 1 test
8. `tab selection tests` - 3 tests
9. `maximize tests` - 2 tests
10. `drag rect tests` - 2 tests
11. `edge rect tests` - 1 test
12. `layout persistence` - 2 tests

**Migration Notes**: Migrate by describe block. Heavy use of custom helpers requires migrating helpers first.

#### 3. `e2e/utils/helpers.ts` (165 lines)

**Purpose**: Shared utility functions for FlexLayout testing

**Exports (9 functions + 1 enum)**:
| Export | Type | Purpose |
|--------|------|---------|
| `findAllTabSets(page)` | Function | Locate all tabset elements |
| `findPath(page, path)` | Function | Find element by layout path attribute |
| `findTabButton(page, path, index)` | Function | Find specific tab button |
| `checkTab(page, path, index, selected, text)` | Function | Assert tab state (combined assertions) |
| `checkBorderTab(page, path, index, selected, text)` | Function | Assert border tab state |
| `Location` | Const object | Enum for drag positions |
| `LocationValue` | Type | Union type for Location values |
| `drag(page, from, to, loc)` | Function | Drag element to location |
| `dragToEdge(page, from, edgeIndex)` | Function | Drag to layout edge |
| `dragSplitter(page, from, upDown, distance)` | Function | Drag splitter by distance |

**Migration Notes**: All functions must become Effect-returning functions with typed parameters.

#### 4. `e2e/fixtures/auth.setup.ts` (19 lines)

**Purpose**: Playwright authentication setup for authenticated test scenarios

**Status**: **UNUSED** - Not configured in any Playwright project

**Migration Notes**: Can be deleted or converted to Effect Layer if authenticated tests are added later.

#### 5. `e2e/fixtures/base.fixture.ts` (4 lines)

**Purpose**: Base fixture re-export (minimal customization)

**Status**: **UNUSED** - Tests import directly from `@playwright/test`

**Migration Notes**: Delete - provides no value.

---

## Dependency Map

### Import Graph

```
                         @playwright/test
                              │
          ┌───────────────────┼───────────────────┐
          │                   │                   │
          ▼                   ▼                   ▼
   smoke.e2e.ts        flexlayout.e2e.ts    fixtures/*.ts
                              │
                              ▼
                        ./utils (index.ts)
                              │
                              ▼
                         helpers.ts
                              │
                              ▼
                       @playwright/test
```

### Per-File Dependencies

| File | External Imports | Internal Imports | Fixture Deps |
|------|-----------------|------------------|--------------|
| `smoke.e2e.ts` | `@playwright/test` | None | None |
| `flexlayout.e2e.ts` | `@playwright/test` | `./utils` (9 exports) | None |
| `utils/helpers.ts` | `@playwright/test` | None | None |
| `utils/index.ts` | None | `./helpers.js` | None |
| `fixtures/auth.setup.ts` | `@playwright/test` | None | None |
| `fixtures/base.fixture.ts` | `@playwright/test` | None | None |

### @beep/* Package Imports

**None.** The tsconfig defines path mappings for `@beep/schema`, `@beep/ui/*`, and `@beep/utils`, but no test files actually import from these packages.

### Key Finding: Unused Fixtures

| File | Status | Evidence |
|------|--------|----------|
| `auth.setup.ts` | UNUSED | Not in playwright.config.ts projects |
| `base.fixture.ts` | UNUSED | No test file imports from it |

---

## Pattern Catalog

### Test Structure Patterns

| Pattern | Count | Example Location | Complexity |
|---------|-------|------------------|------------|
| `test.describe()` | 14 | `flexlayout.e2e.ts:20` | Simple |
| `test()` | 38 | `smoke.e2e.ts:4` | Simple |
| `test.beforeEach()` | 12 | `flexlayout.e2e.ts:21` | Simple |
| `test.use()` | 1 | `flexlayout.e2e.ts:14` | Simple |
| `test as setup` | 1 | `auth.setup.ts:5` | Medium |

### Page Interaction Patterns

| Pattern | Count | Example Location | Complexity |
|---------|-------|------------------|------------|
| `page.goto()` | 19 | `smoke.e2e.ts:5` | Simple |
| `.click()` | 19 | `flexlayout.e2e.ts:181` | Simple |
| `.fill()` | 2 | `auth.setup.ts:10` | Simple |
| `.dblclick()` | 3 | `flexlayout.e2e.ts:463` | Simple |
| `page.mouse.move()` | 15 | `flexlayout.e2e.ts:506` | Complex |
| `page.mouse.down()` | 6 | `flexlayout.e2e.ts:507` | Medium |
| `page.mouse.up()` | 6 | `flexlayout.e2e.ts:514` | Medium |

### Locator Patterns

| Pattern | Count | Example Location | Complexity |
|---------|-------|------------------|------------|
| `page.locator()` | 26 | `helpers.ts:4` | Simple |
| `page.getByLabel()` | 2 | `auth.setup.ts:10` | Simple |
| `page.getByRole()` | 1 | `auth.setup.ts:12` | Simple |
| `.first()` | 6 | `flexlayout.e2e.ts:230` | Simple |
| `.nth()` | 1 | `helpers.ts:136` | Simple |
| Data attribute selectors | ~10 | `helpers.ts:8` | Simple |

### Assertion Patterns

| Pattern | Count | Example Location | Complexity |
|---------|-------|------------------|------------|
| `expect().toBeVisible()` | 19 | `helpers.ts:25` | Simple |
| `expect().not.toBeVisible()` | 3 | `flexlayout.e2e.ts:401` | Simple |
| `expect().toHaveCount()` | 13 | `flexlayout.e2e.ts:51` | Simple |
| `expect().toHaveClass()` | 4 | `helpers.ts:26` | Medium |
| `expect().toContainText()` | 9 | `helpers.ts:35` | Simple |
| `expect().toHaveTitle()` | 1 | `smoke.e2e.ts:6` | Simple |
| `expect().toBeGreaterThan()` | 3 | `flexlayout.e2e.ts:251` | Simple |
| `expect().toBeLessThan()` | 3 | `flexlayout.e2e.ts:252` | Simple |

### Wait Patterns

| Pattern | Count | Example Location | Notes |
|---------|-------|------------------|-------|
| `waitForSelector()` | 15 | `flexlayout.e2e.ts:23` | Used in beforeEach |
| `waitForTimeout()` | 1 | `flexlayout.e2e.ts:614` | **AVOID** - fixed delay |

### Custom Helper Patterns

| Helper | Count | Complexity | Notes |
|--------|-------|------------|-------|
| `drag()` | 12 | Complex | Multi-step mouse drag with location targeting |
| `dragSplitter()` | 2 | Complex | Splitter resize with direction/distance |
| `dragToEdge()` | 1 | Complex | Drag to layout edge rects |
| `findAllTabSets()` | 9 | Simple | Locator factory |
| `findPath()` | ~15 | Simple | Data attribute path locator |
| `findTabButton()` | 18 | Simple | Tab button locator |
| `checkTab()` | 12 | Medium | Combined assertions |
| `checkBorderTab()` | 2 | Medium | Border tab assertions |
| `Location` enum | 12 | Simple | Drop location constants |

---

## Key Patterns Requiring Migration

### 1. Coordinate-Based Drag (Complex)

**File**: `e2e/utils/helpers.ts:102`

```typescript
export async function drag(
  page: Page,
  from: Locator,
  to: Locator,
  loc: LocationValue
) {
  const fr = await from.boundingBox();
  const tr = await to.boundingBox();

  if (!fr || !tr) throw new Error("Could not get bounding boxes");

  const cf = getLocation(fr, Location.CENTER);
  const ct = getLocation(tr, loc);

  await page.mouse.move(cf.x, cf.y);
  await page.mouse.down();
  await page.mouse.move(ct.x, ct.y, { steps: 10 });
  await page.mouse.up();
}
```

**Migration Strategy**: Use `page.use()` escape hatch for raw mouse operations.

### 2. Combined State Assertions (Medium)

**File**: `e2e/utils/helpers.ts:15`

```typescript
export const checkTab = async (
  page: Page,
  path: string,
  index: number,
  selected: boolean,
  text: string
) => {
  const tabButton = findTabButton(page, path, index);
  const tabContent = findPath(page, `${path}/t${index}`);

  await expect(tabButton).toBeVisible();
  await expect(tabButton).toHaveClass(
    new RegExp(selected ? "flexlayout__tab_button--selected" : "flexlayout__tab_button--unselected")
  );
  // ...
};
```

**Migration Strategy**: Convert to Effect.gen with `locator.use()` for Playwright assertions.

### 3. beforeEach with Selector Wait (Simple)

**File**: `e2e/flexlayout.e2e.ts:21`

```typescript
test.beforeEach(async ({ page }) => {
  await page.goto("/demo?layout=test_two_tabs");
  await page.waitForSelector(".flexlayout__layout");
});
```

**Migration Strategy**: Move to Layer composition or test setup function.

---

## Questions for Phase 2

1. **Fixture cleanup strategy**: Should unused fixtures (`auth.setup.ts`, `base.fixture.ts`) be deleted or converted?

2. **Helper architecture**: Should helpers become:
   - Utility functions returning Effects (simpler)
   - A proper Effect Layer/Service (more structured)

3. **Assertion approach**: How to handle Playwright's rich assertions (`toBeVisible`, `toHaveClass`) with Effect?
   - Wrap via `locator.use(l => expect(l).toBeVisible())`
   - Convert to testkit's `assert`/`strictEqual`

4. **baseURL configuration**: FlexLayout uses `test.use({ baseURL: "http://localhost:3001" })`. How to configure this in Effect-based tests?

5. **beforeEach migration**: Should become:
   - Shared Layer setup
   - Per-test Effect.gen preamble
   - Custom withSetup wrapper

---

## Architectural Notes

1. **No Effect integration exists**: All tests are pure @playwright/test
2. **Clean dependency graph**: No circular dependencies
3. **Self-contained helpers**: utils/helpers.ts has no internal dependencies
4. **Unused scaffolding**: Fixtures appear to be unused boilerplate

---

## Migration Order (Recommended)

1. **smoke.e2e.ts** - Validate approach with simplest file
2. **utils/helpers.ts** + **utils/index.ts** - Required for flexlayout tests
3. **flexlayout.e2e.ts** - Migrate by describe block
4. **fixtures/** - Delete unused files
5. **Configuration updates** - Update playwright.config.ts test patterns
