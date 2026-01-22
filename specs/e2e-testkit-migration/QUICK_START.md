# Quick Start: E2E Testkit Migration

> 5-minute orientation for new sessions working on this spec.

---

## What is this spec?

This spec guides migrating e2e tests from raw `@playwright/test` to the Effect-based `@beep/testkit/playwright` module, establishing a canonical pattern for browser automation tests.

## Current State

- Tests use raw `@playwright/test` with async/await patterns
- Custom helper functions in `e2e/utils/helpers.ts`
- No Effect patterns, Context.Tag services, or scoped resources
- ~50+ test cases across 2 main files

## Target State

- All tests use `@beep/testkit/playwright` Effect wrappers
- Browser lifecycle managed via Effect Scopes
- Helper functions return Effects instead of Promises
- Consistent with monorepo Effect patterns

---

## Phase Status

| Phase | Name | Status | Output |
|-------|------|--------|--------|
| P1 | Discovery | Pending | Test catalog, patterns research |
| P2 | Evaluation | Pending | Compliance review, architecture validation |
| P3 | Synthesis | Pending | Consolidated learnings, validated plan |
| P4 | Implementation | Pending | Migrated test files |

---

## Key Conversion Patterns

| Legacy | Effect-Based |
|--------|--------------|
| `import { test } from "@playwright/test"` | `import { layer } from "@beep/testkit"` |
| `test("name", async ({ page }) => {...})` | `it.scoped("name", Effect.fn(function* () {...}, withBrowser))` |
| `await page.goto(url)` | `yield* page.goto(url)` |
| `expect(value).toBe(x)` | `strictEqual(value, x)` |
| Complex mouse ops | `yield* page.use(async (p) => {...})` |

---

## Files to Migrate

| File | Lines | Tests | Priority |
|------|-------|-------|----------|
| `e2e/smoke.e2e.ts` | ~8 | 1 | 1 (start here) |
| `e2e/utils/helpers.ts` | ~166 | N/A | 2 (before flexlayout) |
| `e2e/flexlayout.e2e.ts` | ~620 | 50+ | 3 (incremental) |

---

## Quick Commands

```bash
# Verify baseline tests pass
bun run test:e2e

# After smoke migration
bun run test:e2e --grep "smoke"

# After helpers migration
bun run check

# Full verification
bun run test:e2e && bun run check && bun run lint
```

---

## Reference Files

| File | Purpose |
|------|---------|
| `tooling/testkit/src/playwright/` | Target module API |
| `tooling/testkit/test/playwright/page.test.ts` | Working examples |
| `.claude/rules/effect-patterns.md` | Effect coding standards |
| `MASTER_ORCHESTRATION.md` | Detailed migration steps |

---

## Starting a Phase

1. Read the orchestrator prompt: `handoffs/P[N]_ORCHESTRATOR_PROMPT.md`
2. Verify pre-flight checklist passes
3. Execute delegated tasks
4. Create deliverables in `outputs/`
5. Update `REFLECTION_LOG.md` with learnings
6. Prepare handoff for next phase

---

## Success Criteria

- [ ] All tests pass: `bun run test:e2e`
- [ ] Type check passes: `bun run check`
- [ ] Lint passes: `bun run lint`
- [ ] No `@playwright/test` imports remain
- [ ] All helpers use Effect wrappers
- [ ] `REFLECTION_LOG.md` documents learnings

---

## Need Help?

- Full spec: [README.md](./README.md)
- Migration steps: [MASTER_ORCHESTRATION.md](./MASTER_ORCHESTRATION.md)
- Agent prompts: [AGENT_PROMPTS.md](./AGENT_PROMPTS.md)
- Evaluation criteria: [RUBRICS.md](./RUBRICS.md)
- Session learnings: [REFLECTION_LOG.md](./REFLECTION_LOG.md)
