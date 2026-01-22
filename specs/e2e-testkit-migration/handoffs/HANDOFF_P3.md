# Phase 3 → Phase 4 Handoff

## Phase 3 Summary

**Completed**: 2026-01-22
**Duration**: ~1.5 hours
**Method**: Direct synthesis (no agent delegation needed)

### Synthesis Outputs Created

- [x] `outputs/meta-reflection-synthesis.md` - Consolidated learnings
- [x] `MASTER_ORCHESTRATION.md` - Updated with corrections and checklists

### Verification Table

| Artifact | Status | Verification Command |
|----------|--------|---------------------|
| `outputs/meta-reflection-synthesis.md` | [x] Created | `test -f outputs/meta-reflection-synthesis.md && echo "OK"` |
| Universal learnings documented | [x] Complete | `grep -c "Universal" outputs/meta-reflection-synthesis.md` |
| Spec-specific learnings documented | [x] Complete | `grep -c "Spec-Specific" outputs/meta-reflection-synthesis.md` |
| MASTER_ORCHESTRATION validated | [x] Complete | Corrections applied for escape hatch patterns |
| Rollback strategy documented | [x] Complete | `grep -c "Rollback" MASTER_ORCHESTRATION.md` |
| REFLECTION_LOG updated | [x] Complete | `grep -c "Phase 3" REFLECTION_LOG.md` |

---

## Critical Discovery: Mouse API Correction

**Phase 2 stated (WRONG)**: "Mouse ops already Effect-wrapped"

**Phase 3 verified (CORRECT)**: Testkit does NOT wrap `page.mouse.*` methods.

**Evidence**: Grep search for "mouse" in `tooling/testkit/src/playwright/` returned zero matches.

**Impact**: All drag operations MUST use `page.use()` escape hatch:

```typescript
// REQUIRED for ALL mouse operations
yield* page.use(async (p) => {
  await p.mouse.move(x, y);
  await p.mouse.down();
  await p.mouse.move(x2, y2, { steps: 10 });
  await p.mouse.up();
});
```

---

## Corrected Patterns (From Synthesis)

### Service Injection Model

| What | Injectable? | How to Access |
|------|-------------|---------------|
| Browser | YES | `yield* PlaywrightBrowser` |
| Page | NO | `yield* browser.newPage()` |
| Locator | NO | `page.locator(selector)` |

### Escape Hatch Requirements

| API | Needs Escape? | Example |
|-----|---------------|---------|
| `page.goto()` | NO | `yield* page.goto(url)` |
| `page.locator().click()` | NO | `yield* loc.click()` |
| `locator.boundingBox()` | NO | `yield* loc.boundingBox()` |
| `page.mouse.*` | **YES** | `yield* page.use((p) => p.mouse.move(...))` |
| `page.waitForSelector()` | **YES** | `yield* page.use((p) => p.waitForSelector(...))` |
| `page.setViewportSize()` | **YES** | `yield* page.use((p) => p.setViewportSize(...))` |

---

## Final Migration Plan (Corrected)

### Phase 4.0: Cleanup (~5 min)

Delete unused fixtures:

```bash
rm e2e/fixtures/auth.setup.ts e2e/fixtures/base.fixture.ts
```

### Phase 4.1: Smoke Tests (~30 min)

**File**: `e2e/smoke.e2e.ts`
**Approach**: Complete rewrite (8 lines → ~25 lines)

```bash
# Verification command
bun test e2e/smoke.e2e.ts
```

### Phase 4.2: Helper Utilities (~2 hours)

**File**: `e2e/utils/helpers.ts`
**Approach**: Convert each function to Effect-returning signature

| Function | Complexity | Notes |
|----------|------------|-------|
| `findAllTabSets` | Simple | Returns locator (sync) |
| `findPath` | Simple | Returns locator (sync) |
| `findTabButton` | Simple | Uses findPath (sync) |
| `checkTab` | Medium | Returns Effect |
| `checkBorderTab` | Medium | Returns Effect |
| `drag` | Complex | Uses escape hatch |
| `dragToEdge` | Complex | Uses escape hatch |
| `dragSplitter` | Complex | Uses escape hatch |

```bash
# Verification command
bun run check
```

### Phase 4.3: FlexLayout Tests (~4-6 hours)

**File**: `e2e/flexlayout.e2e.ts`
**Approach**: Migrate one describe block at a time

**Corrected test inventory** (12 describe blocks, 32 tests):

| # | Describe Block | Tests | Priority |
|---|----------------|-------|----------|
| 1 | drag tests (test_two_tabs) | 6 | 3 |
| 2 | three tabs tests (test_three_tabs) | 4 | 3 |
| 3 | border tests (test_with_borders) | 5 | 3 |
| 4 | splitter tests | 2 | 4 |
| 5 | vertical splitter tests | 1 | 4 |
| 6 | add tab tests | 3 | 1 |
| 7 | close tab tests | 1 | 1 |
| 8 | tab selection tests | 3 | 1 |
| 9 | maximize tests | 2 | 1 |
| 10 | drag rect tests | 2 | 5 |
| 11 | edge rect tests | 1 | 5 |
| 12 | layout persistence | 2 | 2 |

**Migration order by priority:**
1. Groups 6-9 (simplest, no drag helpers)
2. Group 12 (persistence)
3. Groups 1-3 (core drag tests)
4. Groups 4-5 (splitters)
5. Groups 10-11 (raw mouse tests)

```bash
# Verification after each block
bun test e2e/flexlayout.e2e.ts --grep "<block-name>"
```

---

## Rollback Strategy

If migration fails at any point:

1. **Revert file changes**: `git checkout -- e2e/`
2. **Verify original tests pass**: `bunx playwright test`
3. **Document failure** in REFLECTION_LOG.md
4. **Assess blockers** before retry

---

## Context for Phase 4 Agent

### Starting Point

You are beginning Phase 4 (Implementation) of the e2e testkit migration. All discovery, evaluation, and synthesis are complete. Start implementation immediately using the corrected patterns.

### Your Tasks

1. **Delete unused fixtures** (first)
2. **Migrate smoke.e2e.ts** (validates infrastructure)
3. **Migrate utils/helpers.ts** (dependency for flexlayout)
4. **Migrate flexlayout.e2e.ts by group** (incremental)
5. **Update REFLECTION_LOG.md** with learnings

### Key Imports (Copy-Paste Ready)

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

### Test Structure Pattern

```typescript
describe.skipIf(!isPlaywrightAvailable)("Suite Name", () => {
  layer(PlaywrightEnvironment.layer(chromium))((it) => {
    it.scoped(
      "test name",
      Effect.fn(function* () {
        const browser = yield* PlaywrightBrowser;
        const page = yield* browser.newPage();
        yield* page.goto("http://localhost:3001/demo");
        // Test assertions
      }, PlaywrightEnvironment.withBrowser)
    );
  });
});
```

### Helper Function Pattern (with mouse escape hatch)

```typescript
export const drag = (
  page: PlaywrightPage.Service,
  fromSelector: string,
  toSelector: string,
  loc: LocationValue
): Effect.Effect<void, PlaywrightError.Type> =>
  Effect.gen(function* () {
    const from = page.locator(fromSelector);
    const to = page.locator(toSelector);

    const frBox = yield* from.boundingBox();
    if (!frBox) return yield* Effect.fail(new Error("No bounding box"));

    const toBox = yield* to.boundingBox();
    if (!toBox) return yield* Effect.fail(new Error("No bounding box"));

    // MUST use escape hatch for mouse operations
    yield* page.use(async (p) => {
      await p.mouse.move(frBox.x + frBox.width / 2, frBox.y + frBox.height / 2);
      await p.mouse.down();
      await p.mouse.move(toBox.x + toBox.width * loc.x, toBox.y + toBox.height * loc.y, { steps: 10 });
      await p.mouse.up();
    });
  });
```

### Verification Commands

```bash
# After each file
bun run check

# Test smoke
bun test e2e/smoke.e2e.ts

# Test flexlayout group
bun test e2e/flexlayout.e2e.ts --grep "group name"

# Final verification
bun run test:e2e
bun run lint
```

---

## Key Reference Files

| Reference | Purpose |
|-----------|---------|
| `outputs/meta-reflection-synthesis.md` | Consolidated patterns |
| `MASTER_ORCHESTRATION.md` | Detailed conversion patterns |
| `tooling/testkit/test/playwright/page.test.ts` | Working example tests |
| `tooling/testkit/src/playwright/page.ts` | Page service API |

---

## Agents for Phase 4

| Agent | Purpose |
|-------|---------|
| `test-writer` | Generate test implementations |
| `effect-code-writer` | Convert helper functions |
| `package-error-fixer` | Fix type/lint errors |

---

## Success Criteria for Phase 4

- [ ] Unused fixtures deleted
- [ ] `smoke.e2e.ts` migrated and passing
- [ ] `utils/helpers.ts` converted to Effect patterns
- [ ] All 12 describe blocks in `flexlayout.e2e.ts` migrated
- [ ] `bun run test:e2e` passes all tests
- [ ] `bun run check` passes
- [ ] `bun run lint` passes
- [ ] No raw `@playwright/test` imports remain in e2e/
- [ ] REFLECTION_LOG.md updated with implementation learnings

---

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| "Service not found" | Ensure layer provides PlaywrightEnvironment |
| "page.mouse undefined" | Use `page.use()` escape hatch |
| "waitForSelector not a function" | Use `page.use()` escape hatch |
| Timeout | Increase `timeout` option in layer() |
| Type mismatch | Use `.use()` for raw Playwright access |
| Test isolation | Each it.scoped() gets fresh context |

---

## Completion Steps

After all tests pass:

1. Update REFLECTION_LOG.md with final retrospective
2. Commit with message: `refactor(e2e): migrate to @beep/testkit/playwright`
3. Mark spec as complete in README.md status
4. Consider documentation updates for other maintainers
