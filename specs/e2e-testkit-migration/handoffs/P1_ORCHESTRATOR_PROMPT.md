# Phase 1 Orchestrator Prompt

Copy-paste this prompt to start Phase 1 (Discovery) execution.

---

## Pre-Flight Checklist

Before executing this phase, verify:
- [ ] `tooling/testkit/src/playwright/` exists (testkit module)
- [ ] `tooling/testkit/test/playwright/page.test.ts` exists (example tests)
- [ ] `e2e/` folder exists with current tests
- [ ] `bun run test:e2e` passes (baseline verification)

If any items are missing, stop and investigate before proceeding.

---

## Prompt

You are executing Phase 1 (Discovery) of the E2E Testkit Migration spec.

### Context

The `./e2e` folder contains Playwright tests written before the `@beep/testkit/playwright` module existed. This phase performs read-only discovery to understand what needs to be migrated.

### Your Mission

Catalog all existing e2e tests, their patterns, dependencies, and document the target Effect-based patterns.

### Deliverables

1. `specs/e2e-testkit-migration/outputs/codebase-context.md`
2. `specs/e2e-testkit-migration/outputs/effect-research.md`

### Discovery Tasks

**Task 1.1: Test Inventory**
Delegate to `codebase-researcher`:
```
Catalog all e2e test files in the beep-effect monorepo.

Search targets:
1. e2e/**/*.ts
2. e2e/**/*.e2e.ts

For each test file, document:
- File path
- Line count
- Test count (number of test() calls)
- Describe blocks
- Imports used

Special attention to:
- e2e/smoke.e2e.ts
- e2e/flexlayout.e2e.ts
- e2e/utils/helpers.ts

Output: Test inventory table with complexity assessment.
```

**Task 1.2: Dependency Analysis**
Delegate to `codebase-researcher`:
```
Map all dependencies used in e2e tests.

For each test file, document:
- External imports (@playwright/test, playwright)
- Internal imports (./utils/helpers, ./fixtures/)
- Fixture dependencies

Key questions:
1. Which files import from @playwright/test?
2. Which files use the helpers utility?
3. What fixture patterns are used?

Output: Dependency map with import paths.
```

**Task 1.3: Pattern Extraction**
Delegate to `codebase-researcher`:
```
Extract all Playwright patterns currently used.

Pattern categories to identify:
1. Test structure (test(), describe())
2. Page interactions (goto, click, fill)
3. Assertions (expect().toBe, toBeVisible)
4. Locators (page.locator, getByRole)
5. Custom helpers (drag, findPath, etc.)

For each pattern:
- Count of occurrences
- Example file:line
- Complexity (simple, medium, complex)

Output: Pattern catalog with usage counts.
```

**Task 1.4: Effect Patterns Research**
Delegate to `mcp-researcher`:
```
Research Effect patterns relevant to browser automation.

Query the Effect documentation for:
1. Effect.fn() decorator usage
2. Scoped resource management
3. Context.Tag service patterns
4. Layer composition for tests

Also examine:
- tooling/testkit/src/playwright/index.ts
- tooling/testkit/test/playwright/page.test.ts

Output: Pattern mapping from @playwright/test → @beep/testkit/playwright
```

### Output Format

Each deliverable should include:
- **Executive Summary**: Key findings (2-3 sentences)
- **Inventory/Catalog**: Tables with counts and examples
- **Pattern Analysis**: What patterns exist and their complexity
- **Questions for Phase 2**: Anything needing deeper evaluation

### Reference Files

| File | Purpose |
|------|---------|
| `tooling/testkit/src/playwright/` | Target module implementation |
| `tooling/testkit/test/playwright/page.test.ts` | Example Effect-based tests |
| `.claude/rules/effect-patterns.md` | Effect coding standards |
| `e2e/` | Current tests to migrate |

### Success Criteria

- [ ] `outputs/codebase-context.md` created with complete test inventory
- [ ] `outputs/effect-research.md` created with pattern mappings
- [ ] All test files cataloged with line counts and test counts
- [ ] Dependencies mapped (what imports what)
- [ ] Current Playwright patterns documented
- [ ] Target Effect patterns documented
- [ ] `REFLECTION_LOG.md` updated with Phase 1 learnings

### Handoff Document

Full context: `specs/e2e-testkit-migration/handoffs/HANDOFF_P1.md`

### Next Steps

After completing Phase 1:
1. Update `specs/e2e-testkit-migration/REFLECTION_LOG.md` with learnings
2. Update `specs/e2e-testkit-migration/handoffs/HANDOFF_P1.md` with summary
3. Create/update `specs/e2e-testkit-migration/handoffs/HANDOFF_P2.md` for next phase
4. Proceed to Phase 2 using `P2_ORCHESTRATOR_PROMPT.md`
