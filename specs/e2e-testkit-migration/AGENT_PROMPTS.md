# Agent Prompts: E2E Testkit Migration

> Ready-to-use prompts for specialized agents working on this spec.

---

## Phase 1: Discovery

### Codebase Researcher - Test Inventory

```
You are cataloging e2e tests in the beep-effect monorepo.

## Mission
Create a complete inventory of all e2e test files, their test counts, and dependencies.

## Search Targets
1. e2e/**/*.ts
2. e2e/**/*.e2e.ts

## For Each Test File
Document:
- File path
- Line count
- Test count (number of test() calls)
- Describe blocks (nested structure)
- Import statements

## Specific Files to Analyze
1. e2e/smoke.e2e.ts - Simple smoke test
2. e2e/flexlayout.e2e.ts - Complex FlexLayout tests
3. e2e/utils/helpers.ts - Utility functions
4. e2e/fixtures/base.fixture.ts - Fixture definitions
5. e2e/fixtures/auth.setup.ts - Auth setup

## Dependency Mapping
For each file, document:
- What it imports from @playwright/test
- What it imports from playwright
- What it imports from ./utils or ./fixtures
- Any external dependencies

## Output Format
Create outputs/codebase-context.md with:

| File | Lines | Tests | Describe Blocks | Dependencies |
|------|-------|-------|-----------------|--------------|
| smoke.e2e.ts | 8 | 1 | 0 | @playwright/test |

Include:
- Executive summary
- File-by-file breakdown
- Dependency graph
- Complexity assessment (Low/Medium/High per file)
```

### Codebase Researcher - Pattern Extraction

```
You are extracting Playwright patterns from e2e tests.

## Mission
Identify all Playwright API usage patterns that need conversion.

## Pattern Categories

### 1. Test Structure Patterns
- test() declarations
- describe() blocks
- test.beforeEach/afterEach hooks
- test.use() configurations

### 2. Page Interaction Patterns
- page.goto()
- page.click()
- page.fill()
- page.waitForSelector()
- page.locator()

### 3. Locator Patterns
- locator.click()
- locator.fill()
- locator.textContent()
- locator.boundingBox()
- locator.getAttribute()

### 4. Assertion Patterns
- expect(value).toBe()
- expect(value).toBeTruthy()
- expect(locator).toBeVisible()
- expect(locator).toHaveText()

### 5. Complex Patterns
- Mouse operations (mouse.move, mouse.down, mouse.up)
- Keyboard operations
- Drag and drop sequences
- Multiple locator coordination

## For Each Pattern
Document:
- Pattern syntax
- Occurrence count
- Example file:line
- Conversion complexity (Simple/Medium/Complex)

## Output Format
Update outputs/codebase-context.md with pattern catalog:

| Pattern | Count | Example | Complexity |
|---------|-------|---------|------------|
| page.goto(url) | 15 | smoke.e2e.ts:5 | Simple |
| locator.boundingBox() | 8 | helpers.ts:42 | Complex |
```

### MCP Researcher - Effect Patterns

```
You are researching Effect patterns for browser automation.

## Mission
Document the @beep/testkit/playwright module API and usage patterns.

## Research Targets

### 1. Module Structure
Query Effect docs and examine:
- tooling/testkit/src/playwright/index.ts
- tooling/testkit/src/playwright/page.ts
- tooling/testkit/src/playwright/locator.ts
- tooling/testkit/src/playwright/browser.ts
- tooling/testkit/src/playwright/environment.ts

### 2. Service Tags
Document available Context.Tags:
- PlaywrightPage
- PlaywrightLocator
- PlaywrightBrowser
- PlaywrightEnvironment

### 3. Layer Composition
Understand:
- PlaywrightEnvironment.layer(browserType)
- PlaywrightEnvironment.withBrowser decorator
- Scoped resource management

### 4. API Mapping
For each Playwright API:
- What is the Effect-wrapped equivalent?
- Does it return Effect or raw value?
- When to use .use() escape hatch?

## Example Tests
Study: tooling/testkit/test/playwright/page.test.ts

Extract:
- Test structure patterns
- Service injection patterns
- Assertion patterns
- Resource management patterns

## Output Format
Create outputs/effect-research.md with:

| Playwright API | Effect Wrapper | Notes |
|----------------|----------------|-------|
| page.goto(url) | page.goto(url) | Returns Effect |
| page.locator(sel) | page.locator(sel) | Returns Service |
| locator.boundingBox() | locator.use(l => l.boundingBox()) | Escape hatch |
```

---

## Phase 2: Evaluation

### Code Reviewer - Guideline Compliance

```
You are evaluating e2e tests against Effect coding standards.

## Mission
Score each e2e test file on compliance with .claude/rules/effect-patterns.md

## Files to Review
1. e2e/smoke.e2e.ts
2. e2e/flexlayout.e2e.ts
3. e2e/utils/helpers.ts

## Scoring Dimensions

### 1. Namespace Imports (0-10)
- 10: Uses namespace imports (import * as X)
- 5: Mixed named and namespace
- 0: All named imports from @playwright/test

### 2. Error Handling (0-10)
- 10: Uses Effect error channels
- 5: Has some error handling
- 0: No error handling or raw try/catch

### 3. Resource Management (0-10)
- 10: Uses Scope for browser lifecycle
- 5: Some manual cleanup
- 0: No resource management

### 4. Testing Framework (0-10)
- 10: Uses @beep/testkit
- 5: Partial migration
- 0: Raw @playwright/test

## For Each Violation
Document:
- File:line reference
- Rule violated
- Suggested fix

## Output Format
Create outputs/guideline-review.md with:

| File | Imports | Errors | Resources | Framework | Total |
|------|---------|--------|-----------|-----------|-------|
| smoke.e2e.ts | 0/10 | 0/10 | 0/10 | 0/10 | 0/40 |

Include violation details per file.
```

### Architecture Pattern Enforcer - Migration Validation

```
You are validating the proposed migration architecture.

## Mission
Ensure the proposed Effect-based test patterns are architecturally sound.

## Validation Areas

### 1. Layer Composition
Verify:
- [ ] PlaywrightEnvironment.layer(chromium) creates valid Layer
- [ ] Browser lifecycle managed in Scope
- [ ] Layer can be composed with other test Layers

### 2. Service Injection
Verify:
- [ ] PlaywrightPage accessible via yield*
- [ ] PlaywrightLocator correctly typed
- [ ] Services work within Effect.fn()

### 3. Test Organization
Verify:
- [ ] layer() for test suites with shared resources
- [ ] it.scoped() for tests needing browser
- [ ] withBrowser decorator applies correctly

### 4. Helper Patterns
Verify:
- [ ] Effect-returning signature works
- [ ] Services can be passed as parameters
- [ ] Escape hatch pattern is valid

## Reference Implementation
Compare against:
- tooling/testkit/test/playwright/page.test.ts

## Output Format
Create outputs/architecture-review.md with:

| Pattern | Valid | Notes |
|---------|-------|-------|
| layer() composition | Yes | Matches testkit examples |
| Service injection | Yes | PlaywrightPage.Service type |

Include recommendations section.
```

---

## Phase 3: Synthesis

### Reflector - Consolidate Learnings

```
You are synthesizing learnings from Phase 1-2.

## Mission
Extract actionable insights from discovery and evaluation outputs.

## Inputs
1. outputs/codebase-context.md
2. outputs/effect-research.md
3. outputs/guideline-review.md
4. outputs/architecture-review.md

## Synthesis Questions

### Universal Learnings
- What conversion patterns apply to ANY Playwright → Effect migration?
- What gotchas would affect future similar migrations?
- What documentation gaps exist?

### Spec-Specific Learnings
- What's unique about this codebase's patterns?
- What helpers require special handling?
- What test fixtures need attention?

### Validated Patterns
- Which conversion patterns are confirmed working?
- Which patterns need escape hatches?
- What's the recommended migration order?

### Risk Summary
- What are the top 3 risks?
- What mitigations are in place?
- What's the rollback strategy?

## Output Format
Create outputs/meta-reflection-synthesis.md with:

# Meta-Reflection Synthesis

## Executive Summary
[2-3 sentences]

## Universal Learnings
1. [learning]
2. [learning]

## Spec-Specific Learnings
1. [learning]
2. [learning]

## Validated Conversion Patterns
| Pattern | Validated | Notes |
|---------|-----------|-------|

## Risk Mitigation Summary
| Risk | Mitigation |
|------|------------|

## Phase 4 Preparation
[Implementation guidance]
```

---

## Phase 4: Implementation

### Test Writer - Smoke Test Migration

```
You are migrating the smoke test to Effect patterns.

## Mission
Convert e2e/smoke.e2e.ts to use @beep/testkit/playwright.

## Source File
e2e/smoke.e2e.ts

## Target Pattern
```typescript
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

## Verification
```bash
bun run test:e2e --grep "smoke"
```

## Success Criteria
- [ ] Test passes
- [ ] No @playwright/test imports
- [ ] Uses Effect.fn() with withBrowser
- [ ] Uses yield* for page operations
```

### Effect Code Writer - Helper Migration

```
You are migrating e2e helper functions to Effect patterns.

## Mission
Convert e2e/utils/helpers.ts to return Effects.

## Source File
e2e/utils/helpers.ts

## Conversion Pattern
```typescript
// BEFORE
export async function findPath(page: Page, path: string) {
  return page.locator(`[data-layout-path='${path}']`);
}

// AFTER
export const findPath = (page: PlaywrightPage.Service, path: string) =>
  Effect.succeed(page.locator(`[data-layout-path='${path}']`));
```

## Complex Operations Pattern
```typescript
// For complex mouse operations, use escape hatch
export const drag = (
  page: PlaywrightPage.Service,
  from: PlaywrightLocator.Service,
  to: PlaywrightLocator.Service,
  location: Location
) =>
  Effect.gen(function* () {
    yield* page.use(async (rawPage) => {
      const fromBox = await from.use((l) => l.boundingBox());
      const toBox = await to.use((l) => l.boundingBox());
      // Mouse operations with raw page
      await rawPage.mouse.move(fromBox.x + fromBox.width / 2, fromBox.y + fromBox.height / 2);
      await rawPage.mouse.down();
      await rawPage.mouse.move(toBox.x + toBox.width / 2, toBox.y + toBox.height / 2);
      await rawPage.mouse.up();
    });
  });
```

## Verification
```bash
bun run check
```

## Success Criteria
- [ ] All functions return Effect
- [ ] Types use Service types
- [ ] Complex ops use escape hatch
- [ ] No type errors
```

### Test Writer - FlexLayout Migration (Incremental)

```
You are migrating FlexLayout tests one describe block at a time.

## Mission
Convert e2e/flexlayout.e2e.ts incrementally.

## Migration Order
1. describe("functional") - 7 tests
2. describe("border panels") - 3 tests
3. describe("drag") - 7 tests
4. describe("external drag") - 3 tests
5. describe("splitters") - 4 tests
6. describe("nested tabsets") - 5 tests
7. describe("popup") - 3 tests
8. describe("maximize") - 4 tests
9. describe("action buttons") - 5 tests
10. describe("overflow menu") - 5 tests
11. describe("serialization") - 4 tests

## Per-Block Process
1. Convert describe block to layer() with nested it.scoped()
2. Update imports and helpers usage
3. Run verification:
   ```bash
   bun run test:e2e --grep "flexlayout.*<block-name>"
   ```
4. If passing, proceed to next block
5. If failing, debug before continuing

## Test Pattern
```typescript
layer(PlaywrightEnvironment.layer(chromium))("flexlayout", (it) => {
  describe("functional", () => {
    it.scoped("can add a tab",
      Effect.fn(function* () {
        const page = yield* PlaywrightPage;
        // Test implementation
      }, PlaywrightEnvironment.withBrowser)
    );
  });
});
```

## Verification
After each block:
```bash
bun run test:e2e --grep "flexlayout"
```

Final verification:
```bash
bun run test:e2e && bun run check && bun run lint
```
```

---

## Cross-Phase Prompts

### Reflector - Session Synthesis

```
You are synthesizing learnings from the current session.

## Mission
Analyze phase execution and extract actionable improvements.

## Analysis Areas

1. **What worked well?**
   - Effective patterns
   - Smooth conversions
   - Clear guidance

2. **What was challenging?**
   - Unexpected patterns
   - Missing documentation
   - Type issues

3. **What should change?**
   - Prompt improvements
   - Process refinements
   - Documentation needs

4. **Learnings for future migrations**
   - Key patterns to preserve
   - Gotchas discovered
   - Time estimates

## Output
Update REFLECTION_LOG.md with structured findings.
```

### Package Error Fixer - Post-Migration Cleanup

```
You are fixing type and build errors after migration.

## Mission
Resolve all errors in the e2e package.

## Error Categories

### 1. Import Errors
- Missing @beep/testkit/playwright imports
- Stale @playwright/test imports

### 2. Type Errors
- Service vs raw type mismatches
- Effect vs Promise mismatches

### 3. Pattern Errors
- yield* missing on Effect operations
- Incorrect decorator usage

## Verification Commands
```bash
bun run check
bun run lint
bun run test:e2e
```

## Success Criteria
- [ ] bun run check passes
- [ ] bun run lint passes
- [ ] bun run test:e2e passes
```
