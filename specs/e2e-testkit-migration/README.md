# E2E Testkit Migration Specification

## Overview

Migrate existing e2e tests from raw `@playwright/test` to the Effect-first `@beep/testkit/playwright` module, establishing a canonical pattern for browser automation tests in the beep-effect monorepo.

## Status: Planning

**Created**: 2026-01-22
**Owner**: AI-assisted migration
**Complexity**: Medium (3-4 phases)

## Problem Statement

The `./e2e` folder contains Playwright tests written with raw `@playwright/test` APIs. A new Effect-based Playwright module has been added to `@beep/testkit` that provides:

- Effect-wrapped browser automation APIs
- Context.Tag-based service injection
- Scoped resource management (automatic cleanup)
- Stream-based event handling
- Integration with `@beep/testkit` assertion helpers

The codebase needs standardization on this new module for consistency with Effect patterns used throughout the project.

## Current State

### Existing E2E Tests (`./e2e/`)

| File | Lines | Purpose |
|------|-------|---------|
| `smoke.e2e.ts` | ~8 | Homepage load verification |
| `flexlayout.e2e.ts` | ~620 | FlexLayout library functionality (50+ test cases) |
| `utils/helpers.ts` | ~166 | Drag/drop, tab management, locator utilities |
| `fixtures/base.fixture.ts` | ~5 | Re-exports @playwright/test |
| `fixtures/auth.setup.ts` | ~20 | Authentication state setup |

### Current Patterns (Legacy)

```typescript
// Raw @playwright/test usage
import { test, expect } from "@playwright/test";

test("homepage loads", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Web/);
});
```

### Target Patterns (New)

```typescript
// Effect-based @beep/testkit/playwright usage
import { layer, scoped, strictEqual } from "@beep/testkit";
import { PlaywrightEnvironment } from "@beep/testkit/playwright/experimental";
import { chromium } from "playwright";
import * as Effect from "effect/Effect";

layer(PlaywrightEnvironment.layer(chromium))((it) => {
  it.scoped("homepage loads",
    Effect.fn(function* () {
      const page = yield* PlaywrightPage;
      yield* page.goto("http://localhost:3000");
      const title = yield* page.title;
      strictEqual(title.includes("Web"), true);
    }, PlaywrightEnvironment.withBrowser)
  );
});
```

## Goals

1. **Standardization**: All e2e tests use `@beep/testkit/playwright`
2. **Effect Patterns**: Proper namespace imports, error handling, resource management
3. **Documentation**: Update references to reflect new canonical approach
4. **Configuration**: Minimal changes to `playwright.config.ts`
5. **Incremental Migration**: Support running old and new tests during transition

## Non-Goals

- Changing test coverage or adding new test cases
- Modifying the `@beep/testkit/playwright` module itself
- Changing webServer configurations in playwright.config.ts

## Migration Scope

### Files to Migrate

1. **Test Files**
   - `e2e/smoke.e2e.ts` → Effect-based smoke test
   - `e2e/flexlayout.e2e.ts` → Effect-based layout tests

2. **Utility Files**
   - `e2e/utils/helpers.ts` → Effect-wrapped helper functions

3. **Fixture Files**
   - `e2e/fixtures/base.fixture.ts` → Remove (use testkit directly)
   - `e2e/fixtures/auth.setup.ts` → Effect-based auth Layer

4. **Configuration**
   - `e2e/playwright.config.ts` → Update testMatch patterns
   - `e2e/tsconfig.json` → Add @beep/testkit paths

### Documentation Updates

- Update any docs referencing e2e test patterns
- Add examples to `tooling/testkit/README.md` if needed
- Update `AGENTS.md` files in affected packages

## Agent Delegation Plan

### Phase 1: Discovery (Read-only)

| Agent | Task | Output |
|-------|------|--------|
| `codebase-researcher` | Catalog all e2e tests, patterns, dependencies | `outputs/codebase-context.md` |
| `mcp-researcher` | Effect patterns for browser automation | `outputs/effect-research.md` |

### Phase 2: Evaluation (Analysis)

| Agent | Task | Output |
|-------|------|--------|
| `code-reviewer` | Evaluate current tests against Effect guidelines | `outputs/guideline-review.md` |
| `architecture-pattern-enforcer` | Validate proposed Layer composition | `outputs/architecture-review.md` |

### Phase 3: Synthesis (Planning)

| Agent | Task | Output |
|-------|------|--------|
| `reflector` | Consolidate Phase 1-2 learnings | `outputs/meta-reflection-synthesis.md` |
| `doc-writer` | Generate detailed migration plan | `MASTER_ORCHESTRATION.md` |

### Phase 4: Implementation (Code Generation)

| Agent | Task | Output |
|-------|------|--------|
| `test-writer` | Migrate smoke tests | Migrated `smoke.e2e.ts` |
| `test-writer` | Migrate flexlayout tests | Migrated `flexlayout.e2e.ts` |
| `effect-code-writer` | Migrate helper utilities | Migrated `helpers.ts` |
| `package-error-fixer` | Fix type/build errors | Passing checks |

## Key Conversion Patterns

### Test Function Conversion

| Legacy | Effect-Based |
|--------|--------------|
| `test("name", async ({ page }) => {...})` | `it.scoped("name", Effect.fn(function* () {...}, withBrowser))` |
| `await page.goto(url)` | `yield* page.goto(url)` |
| `await expect(locator).toBeVisible()` | `yield* locator.use(l => expect(l).toBeVisible())` |
| `page.locator(sel)` | `page.locator(sel)` (returns Service, not Locator) |

### Helper Function Conversion

```typescript
// Legacy
export async function drag(page: Page, from: Locator, to: Locator) {
  const fromBox = await from.boundingBox();
  // ...
}

// Effect-based
export const drag = (
  page: PlaywrightPage.Service,
  from: PlaywrightLocator.Service,
  to: PlaywrightLocator.Service
) =>
  Effect.gen(function* () {
    const fromBox = yield* from.use((l) => l.boundingBox());
    // ...
  });
```

## Success Criteria

- [ ] All tests pass with `bun run test:e2e`
- [ ] `bun run check --filter @beep/testkit` passes
- [ ] No raw `@playwright/test` imports in e2e folder
- [ ] All helpers use Effect wrappers
- [ ] Documentation updated
- [ ] REFLECTION_LOG.md captures learnings

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Complex flexlayout tests break during migration | Migrate incrementally, test each describe block |
| Helper functions have subtle timing dependencies | Use `page.use()` escape hatch for complex operations |
| CI/CD pipeline compatibility | Keep playwright.config.ts changes minimal |
| Effect learning curve for maintainers | Add detailed comments in migrated tests |

## References

- **Source Module**: `tooling/testkit/src/playwright/`
- **Example Tests**: `tooling/testkit/test/playwright/page.test.ts`
- **Effect Patterns**: `.claude/rules/effect-patterns.md`
- **Testing Guide**: `.claude/commands/patterns/effect-testing-patterns.md`
- **Spec Guide**: `specs/_guide/README.md`

## File Structure

```
specs/e2e-testkit-migration/
├── README.md                      # This file
├── REFLECTION_LOG.md              # Learning capture
├── MASTER_ORCHESTRATION.md        # Detailed migration steps (Phase 3 output)
├── outputs/
│   ├── codebase-context.md       # Phase 1: Test catalog
│   ├── effect-research.md        # Phase 1: Effect patterns
│   ├── guideline-review.md       # Phase 2: Guidelines compliance
│   ├── architecture-review.md    # Phase 2: Pattern validation
│   └── meta-reflection-*.md      # Phase 3: Learnings
└── handoffs/
    ├── HANDOFF_P1.md             # Phase 1 → 2 context
    ├── HANDOFF_P2.md             # Phase 2 → 3 context
    └── HANDOFF_P3.md             # Phase 3 → 4 context
```
