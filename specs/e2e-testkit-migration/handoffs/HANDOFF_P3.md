# Phase 3 → Phase 4 Handoff

## Phase 3 Summary

**Completed**: [Date]
**Duration**: [X hours]

### Synthesis Outputs Created

- [ ] `outputs/meta-reflection-synthesis.md` - Consolidated learnings
- [ ] `MASTER_ORCHESTRATION.md` - Validated/updated migration plan

### Verification Table

| Artifact | Status | Verification Command |
|----------|--------|---------------------|
| `outputs/meta-reflection-synthesis.md` | [ ] Created | `test -f outputs/meta-reflection-synthesis.md && echo "OK"` |
| Universal learnings documented | [ ] Complete | `grep -c "Universal" outputs/meta-reflection-synthesis.md` |
| Spec-specific learnings documented | [ ] Complete | `grep -c "Spec-Specific" outputs/meta-reflection-synthesis.md` |
| MASTER_ORCHESTRATION validated | [ ] Complete | Review conversion patterns match findings |
| Rollback strategy documented | [ ] Complete | `grep -c "Rollback" MASTER_ORCHESTRATION.md` |
| REFLECTION_LOG updated | [ ] Complete | `grep -c "Phase 3" REFLECTION_LOG.md` |

### Final Migration Plan

#### Step 1: Smoke Tests (~30 min)

**File**: `e2e/smoke.e2e.ts`
**Approach**: Complete rewrite (small file)

```bash
# Verification command
bun run test:e2e --grep "smoke"
```

#### Step 2: Helper Utilities (~1-2 hours)

**File**: `e2e/utils/helpers.ts`
**Approach**: Convert each function to Effect-returning signature

Functions to convert:
- [ ] `findAllTabSets`
- [ ] `findPath`
- [ ] `findTabButton`
- [ ] `checkTab`
- [ ] `checkBorderTab`
- [ ] `drag`
- [ ] `dragToEdge`
- [ ] `dragSplitter`

```bash
# Verification command
bun run check
```

#### Step 3: FlexLayout Tests (~3-4 hours)

**File**: `e2e/flexlayout.e2e.ts`
**Approach**: Migrate one describe block at a time

Migration order:
1. [ ] `describe("functional")` - 7 tests
2. [ ] `describe("border panels")` - 3 tests
3. [ ] `describe("drag")` - 7 tests
4. [ ] `describe("external drag")` - 3 tests
5. [ ] `describe("splitters")` - 4 tests
6. [ ] `describe("nested tabsets")` - 5 tests
7. [ ] `describe("popup")` - 3 tests
8. [ ] `describe("maximize")` - 4 tests
9. [ ] `describe("action buttons")` - 5 tests
10. [ ] `describe("overflow menu")` - 5 tests
11. [ ] `describe("serialization")` - 4 tests

```bash
# Verification after each block
bun run test:e2e --grep "flexlayout.*<block-name>"
```

#### Step 4: Cleanup (~30 min)

- [ ] Remove deprecated fixture files
- [ ] Update e2e/tsconfig.json if needed
- [ ] Run full verification suite

### Rollback Strategy

If migration fails at any point:

1. **Revert file changes**: `git checkout -- e2e/`
2. **Verify original tests pass**: `bun run test:e2e`
3. **Document failure** in REFLECTION_LOG.md
4. **Assess blockers** before retry

### Key Patterns Validated

_[List the key conversion patterns confirmed in Phase 3]_

1. Test structure: `test() → it.scoped() with Effect.fn()`
2. Page operations: `await page.x() → yield* page.x()`
3. Assertions: `expect().toBe() → strictEqual()`
4. Escape hatch: `page.use()` for unsupported operations

---

## Context for Phase 4 Agent

### Starting Point

You are beginning Phase 4 (Implementation) of the e2e testkit migration. All planning is complete. Your job is to execute the migration.

### Your Tasks

1. Read `MASTER_ORCHESTRATION.md` for detailed conversion patterns
2. Use `test-writer` agent for test file migrations
3. Use `effect-code-writer` agent for helper utility conversions
4. Use `package-error-fixer` agent if type/build errors occur
5. Verify each step with the appropriate command
6. Update REFLECTION_LOG.md with implementation learnings

### Key Reference Files

| Reference | Purpose |
|-----------|---------|
| `MASTER_ORCHESTRATION.md` | Conversion patterns and examples |
| `tooling/testkit/test/playwright/page.test.ts` | Working example tests |
| `.claude/rules/effect-patterns.md` | Coding standards |
| `tooling/testkit/src/playwright/` | Module API |

### Implementation Order

1. `smoke.e2e.ts` - Simplest, validates the approach
2. `utils/helpers.ts` - Required before flexlayout
3. `flexlayout.e2e.ts` - Complex, do incrementally

### Verification Commands

```bash
# After smoke migration
bun run test:e2e --grep "smoke"

# After helper migration
bun run check

# After each flexlayout block
bun run test:e2e --grep "flexlayout"

# Final verification
bun run test:e2e
bun run check
bun run lint
```

### Success Criteria for Phase 4

- [ ] All tests passing with `bun run test:e2e`
- [ ] No type errors: `bun run check`
- [ ] Lint passes: `bun run lint`
- [ ] No raw `@playwright/test` imports remain
- [ ] REFLECTION_LOG.md updated with learnings

### Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Service not found | Ensure layer provides PlaywrightEnvironment |
| Timeout | Increase `timeout` option in layer() |
| Type mismatch | Use `.use()` for raw Playwright access |
| Test isolation | Each it.scoped() gets fresh context |

### Completion Steps

After all tests pass:

1. Update REFLECTION_LOG.md with final retrospective
2. Commit with message: `refactor(e2e): migrate to @beep/testkit/playwright`
3. Mark spec as complete in README.md status
4. Consider documentation updates for other maintainers
