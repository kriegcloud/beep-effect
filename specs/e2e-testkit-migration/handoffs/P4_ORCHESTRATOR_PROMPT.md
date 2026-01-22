# Phase 4 Orchestrator Prompt

Copy-paste this prompt to start Phase 4 (Implementation) execution.

---

## Pre-Flight Checklist

Before executing this phase, verify Phase 3 artifacts exist:
- [ ] `outputs/meta-reflection-synthesis.md` exists (Phase 3)
- [ ] `MASTER_ORCHESTRATION.md` has been updated with corrections (Phase 3)
- [ ] `handoffs/HANDOFF_P3.md` is complete
- [ ] `REFLECTION_LOG.md` contains Phase 3 learnings

If any artifacts are missing, request Phase 3 completion before proceeding.

---

## Prompt

You are executing Phase 4 (Implementation) of the E2E Testkit Migration spec.

### Context

Phases 1-3 have completed discovery, evaluation, and synthesis. The migration plan in `MASTER_ORCHESTRATION.md` has been validated and corrected. All patterns are documented in `outputs/meta-reflection-synthesis.md`.

**Critical Discovery from Phase 3**: The testkit does NOT wrap `page.mouse.*` methods. ALL mouse operations MUST use the `page.use()` escape hatch.

### Your Mission

Migrate all e2e tests from `@playwright/test` to `@beep/testkit/playwright` following the validated patterns.

### Deliverables

1. Deleted unused fixtures (`e2e/fixtures/auth.setup.ts`, `e2e/fixtures/base.fixture.ts`)
2. Migrated `e2e/smoke.e2e.ts`
3. Migrated `e2e/utils/helpers.ts`
4. Migrated `e2e/flexlayout.e2e.ts` (all 12 describe blocks)
5. Updated `REFLECTION_LOG.md` with implementation learnings
6. Created `handoffs/HANDOFF_P4.md` with completion summary

### Implementation Tasks

**Task 4.0: Cleanup (~5 min)**
```bash
# Delete unused fixtures
rm e2e/fixtures/auth.setup.ts e2e/fixtures/base.fixture.ts
```

**Task 4.1: Migrate Smoke Tests (~30 min)**
Delegate to `test-writer`:
```
Migrate e2e/smoke.e2e.ts to @beep/testkit/playwright.

Key imports:
import { describe } from "bun:test";
import { layer, assert } from "@beep/testkit";
import { isPlaywrightAvailable } from "@beep/testkit/playwright";
import { PlaywrightBrowser } from "@beep/testkit/playwright/browser";
import { PlaywrightEnvironment } from "@beep/testkit/playwright/experimental";
import * as Effect from "effect/Effect";
import { chromium } from "playwright-core";

Pattern:
describe.skipIf(!isPlaywrightAvailable)("Smoke Tests", () => {
  layer(PlaywrightEnvironment.layer(chromium))((it) => {
    it.scoped(
      "test name",
      Effect.fn(function* () {
        const browser = yield* PlaywrightBrowser;
        const page = yield* browser.newPage();
        yield* page.goto("http://localhost:3001");
        // assertions
      }, PlaywrightEnvironment.withBrowser)
    );
  });
});

Verify: bun test e2e/smoke.e2e.ts
```

**Task 4.2: Migrate Helper Utilities (~2 hours)**
Delegate to `effect-code-writer`:
```
Migrate e2e/utils/helpers.ts to Effect patterns.

Functions to convert (9 total):
1. findAllTabSets - Returns locator (sync)
2. findPath - Returns locator (sync)
3. findTabButton - Uses findPath (sync)
4. checkTab - Returns Effect
5. checkBorderTab - Returns Effect
6. drag - REQUIRES escape hatch for mouse
7. dragToEdge - REQUIRES escape hatch for mouse
8. dragSplitter - REQUIRES escape hatch for mouse

CRITICAL: All mouse operations MUST use escape hatch:
yield* page.use(async (p) => {
  await p.mouse.move(x, y);
  await p.mouse.down();
  await p.mouse.move(x2, y2, { steps: 10 });
  await p.mouse.up();
});

Type signatures needed:
import type { PlaywrightPage } from "@beep/testkit/playwright/page";
import type { PlaywrightLocator } from "@beep/testkit/playwright/locator";

Verify: bun run check
```

**Task 4.3: Migrate FlexLayout Tests (~4-6 hours)**
Delegate to `test-writer` in batches by priority:

**Batch 1 (Priority 1 - Simplest, no drag helpers):**
```
Migrate flexlayout.e2e.ts describe blocks:
- add tab tests (3 tests)
- close tab tests (1 test)
- tab selection tests (3 tests)
- maximize tests (2 tests)

These tests use basic click/assert patterns without drag operations.
Verify after each: bun test e2e/flexlayout.e2e.ts --grep "<block-name>"
```

**Batch 2 (Priority 2 - Persistence):**
```
Migrate: layout persistence (2 tests)
Verify: bun test e2e/flexlayout.e2e.ts --grep "persistence"
```

**Batch 3 (Priority 3 - Core drag tests):**
```
Migrate:
- drag tests (test_two_tabs) - 6 tests
- three tabs tests (test_three_tabs) - 4 tests
- border tests (test_with_borders) - 5 tests

These tests use the drag helper with escape hatch.
Verify after each: bun test e2e/flexlayout.e2e.ts --grep "<block-name>"
```

**Batch 4 (Priority 4 - Splitters):**
```
Migrate:
- splitter tests (2 tests)
- vertical splitter tests (1 test)

These use dragSplitter helper.
Verify: bun test e2e/flexlayout.e2e.ts --grep "splitter"
```

**Batch 5 (Priority 5 - Raw mouse tests):**
```
Migrate:
- drag rect tests (2 tests)
- edge rect tests (1 test)

These may need direct mouse API usage.
Verify: bun test e2e/flexlayout.e2e.ts --grep "rect"
```

### Error Handling

Use `package-error-fixer` agent for:
- Type errors after migration
- Build failures
- Lint issues

### Key Patterns Reference

| From | To |
|------|-----|
| `import { test, expect } from "@playwright/test"` | See imports above |
| `test("name", async ({ page }) => {...})` | `it.scoped("name", Effect.fn(...))` |
| `await page.goto(url)` | `yield* page.goto(url)` |
| `await page.locator(sel).click()` | `yield* page.locator(sel).click()` |
| `expect(x).toBe(y)` | `strictEqual(x, y)` |
| `expect(x).toBeTruthy()` | `assert(x, "message")` |
| `await page.mouse.move(...)` | `yield* page.use((p) => p.mouse.move(...))` |

### Reference Files

| File | Purpose |
|------|---------|
| `handoffs/HANDOFF_P3.md` | Full context and corrected patterns |
| `outputs/meta-reflection-synthesis.md` | Consolidated learnings |
| `MASTER_ORCHESTRATION.md` | Detailed conversion patterns |
| `tooling/testkit/test/playwright/page.test.ts` | Working example tests |
| `tooling/testkit/src/playwright/page.ts` | Page service API |

### Success Criteria

- [ ] `e2e/fixtures/auth.setup.ts` deleted
- [ ] `e2e/fixtures/base.fixture.ts` deleted
- [ ] `e2e/smoke.e2e.ts` migrated and passing
- [ ] `e2e/utils/helpers.ts` converted to Effect patterns
- [ ] All 12 describe blocks in `e2e/flexlayout.e2e.ts` migrated
- [ ] `bun run test:e2e` passes all tests
- [ ] `bun run check` passes
- [ ] `bun run lint` passes
- [ ] No raw `@playwright/test` imports remain in `e2e/`
- [ ] `REFLECTION_LOG.md` updated with implementation learnings
- [ ] `handoffs/HANDOFF_P4.md` created with completion summary

### Rollback Strategy

If migration fails at any point:
1. **Revert file changes**: `git checkout -- e2e/`
2. **Verify original tests pass**: `bunx playwright test`
3. **Document failure** in REFLECTION_LOG.md
4. **Assess blockers** before retry

### Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| "Service not found" | Ensure layer provides PlaywrightEnvironment |
| "page.mouse undefined" | Use `page.use()` escape hatch |
| "waitForSelector not a function" | Use `page.use()` escape hatch |
| Timeout | Increase `timeout` option in layer() |
| Type mismatch | Use `.use()` for raw Playwright access |
| Test isolation | Each it.scoped() gets fresh context |

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

# Verify no @playwright/test imports remain
grep -r "@playwright/test" e2e/
```

### Next Steps

After completing Phase 4:
1. Create `handoffs/HANDOFF_P4.md` with completion summary
2. Update `REFLECTION_LOG.md` with final retrospective
3. Commit with message: `refactor(e2e): migrate to @beep/testkit/playwright`
4. Mark spec as complete in `specs/e2e-testkit-migration/README.md`
5. Consider documentation updates for other maintainers
