# P7 Orchestrator Prompt: Remediation

> Copy this prompt to start Phase 7 remediation.

---

## Context

You are executing **Phase 7 (Remediation)** of the `lexical-utils-effect-refactor` spec.

Post-completion review identified gaps against rubric requirements:
- `utils/index.ts` is empty (should have barrel exports)
- `UrlPattern` schema missing from `url.schema.ts`
- `url.ts` uses inline regex instead of schema
- No tests created for refactored utilities

**Your mission**: Fix all identified gaps to achieve full rubric compliance.

---

## Required Reading

Before starting, read:
1. `specs/lexical-utils-effect-refactor/handoffs/HANDOFF_P7.md` - Complete task specifications
2. `specs/lexical-utils-effect-refactor/RUBRICS.md` - Scoring criteria
3. `.claude/commands/patterns/effect-testing-patterns.md` - Test patterns

---

## Tasks

### Task 1: Populate utils/index.ts

Write barrel exports for all utilities in `apps/todox/src/app/lexical/utils/index.ts`.

See HANDOFF_P7.md for exact content.

### Task 2: Add UrlPattern Schema

Edit `apps/todox/src/app/lexical/schema/url.schema.ts` to add:
- `UrlPattern` schema using `S.pattern()` with the URL regex
- Type namespace export

### Task 3: Refactor url.ts

Edit `apps/todox/src/app/lexical/utils/url.ts` to:
- Import `UrlPattern` from schema
- Remove inline `urlRegExp` definition
- Use `S.is(UrlPattern)` for validation

### Task 4: Create Tests

Create `apps/todox/test/lexical/utils.test.ts` with test cases for:
- `docToHash` / `docFromHash` round-trip
- `sanitizeUrl` protocol filtering
- `validateUrl` pattern matching
- `joinClasses` falsy value filtering

Use `@beep/testkit` patterns. See HANDOFF_P7.md for example test code.

---

## Verification

After completing all tasks, run:

```bash
# Type check
cd apps/todox && bun tsc --noEmit

# Lint
bun run lint --filter @beep/todox

# Tests
bun run test --filter @beep/todox
```

---

## Completion

When all tasks pass verification:

1. Update `specs/lexical-utils-effect-refactor/README.md`:
   - Change status to `COMPLETE (Remediated)`
   - Add note about P7 remediation

2. Add Phase 7 entry to `specs/lexical-utils-effect-refactor/REFLECTION_LOG.md`

3. Report completion with test results

---

## Constraints

- Do NOT modify files outside the specified scope
- Do NOT change existing function signatures
- Do NOT add dependencies
- Use existing patterns from the codebase
