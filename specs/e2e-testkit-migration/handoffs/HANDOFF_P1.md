# Phase 1 → Phase 2 Handoff

## Phase 1 Summary

**Completed**: 2026-01-22
**Duration**: ~30 minutes (4 parallel agents)

### Discovery Outputs Created

- [x] `outputs/codebase-context.md` - Test catalog and dependency map
- [x] `outputs/effect-research.md` - Effect patterns documentation

### Verification Table

| Artifact | Status | Verification Command |
|----------|--------|---------------------|
| `outputs/codebase-context.md` | [x] Created | `test -f outputs/codebase-context.md && echo "OK"` |
| `outputs/effect-research.md` | [x] Created | `test -f outputs/effect-research.md && echo "OK"` |
| Test files cataloged | [x] Complete (6 files) | `find e2e -name "*.ts" \| wc -l` |
| Pattern mappings documented | [x] Complete (40+ patterns) | `grep -c "Pattern" outputs/codebase-context.md` |
| REFLECTION_LOG updated | [x] Complete | `grep -c "Phase 1" REFLECTION_LOG.md` |

### Key Findings

#### Test Inventory

| File | Lines | Test Count | Complexity | Migration Priority |
|------|-------|------------|------------|-------------------|
| `smoke.e2e.ts` | 8 | 1 | Simple | 1 (start here) |
| `utils/helpers.ts` | 165 | N/A | Medium | 2 (before flexlayout) |
| `flexlayout.e2e.ts` | 619 | 35 | Complex | 3 (after helpers) |
| `fixtures/*` | 23 | N/A | N/A | Delete (unused) |

**Total**: 827 lines, 36 tests, 6 files

#### Patterns Identified

**Test Structure (migrating)**:
1. `test.describe()` (14 occurrences) → `describe()` from bun:test
2. `test()` (38 occurrences) → `it.scoped()` with `Effect.fn()`
3. `test.beforeEach()` (12 occurrences) → Layer setup or test preamble
4. `test.use({ baseURL })` → `PlaywrightEnvironment.layer()` options

**Page Interactions (migrating)**:
1. `await page.goto()` → `yield* page.goto()`
2. `await locator.click()` → `yield* locator.click()`
3. `page.mouse.*` (complex) → `yield* page.use(async (p) => { ... })`

**Assertions (migrating)**:
1. `expect(x).toBe(y)` → `assert(x === y)` or escape hatch
2. `expect(loc).toBeVisible()` → `yield* loc.use(l => expect(l).toBeVisible())`
3. `expect(loc).toHaveCount(n)` → `const count = yield* loc.count(); assert(count === n)`

#### Dependencies Mapped

| Dependency | Current | Target | Action |
|------------|---------|--------|--------|
| `@playwright/test` | Used by all 6 files | `@beep/testkit` | Replace imports |
| `playwright-core` | Not used | `chromium` import | Add for browser type |
| `./utils/helpers` | Used by flexlayout | Internal | Migrate signatures |
| `@beep/*` packages | None | None | No cross-package deps |

### Challenges Identified

1. **Challenge**: Complex drag operations (15 mouse.move calls)
   - **Impact**: Cannot be pure Effect
   - **Solution**: Use `page.use()` escape hatch ✓ confirmed

2. **Challenge**: Helper type signatures
   - **Impact**: `Page` → `PlaywrightPage.Service`, `Locator` → `PlaywrightLocator.Service`
   - **Solution**: Update all helper function parameters

3. **Challenge**: beforeEach setup pattern
   - **Impact**: 12 occurrences need conversion
   - **Solution**: Extract to helper or use Layer composition

4. **Challenge**: Unused fixtures
   - **Impact**: Dead code confusion
   - **Solution**: Delete `fixtures/auth.setup.ts` and `fixtures/base.fixture.ts`

### Questions for Phase 2

1. **Compliance threshold**: What Effect pattern compliance score blocks migration?
2. **baseURL configuration**: Best approach for FlexLayout's `http://localhost:3001`?
3. **Assertion strategy**: Prefer Playwright's `expect()` via escape hatch or testkit's `assert()`?
4. **Test isolation verification**: Need to run baseline `bun run test:e2e` before migration?

---

## Context for Phase 2 Agent

### Starting Point

You are beginning Phase 2 (Evaluation) of the e2e testkit migration. Phase 1 has completed discovery and the outputs are available in `outputs/`.

### Your Tasks

1. Read `outputs/codebase-context.md` to understand current test structure
2. Read `outputs/effect-research.md` to understand target patterns
3. Use `code-reviewer` agent to evaluate compliance with `.claude/rules/effect-patterns.md`
4. Use `architecture-pattern-enforcer` agent to validate proposed migration architecture
5. Create `outputs/guideline-review.md` and `outputs/architecture-review.md`
6. Document your findings in `handoffs/HANDOFF_P2.md`

### Key Files to Reference

- `.claude/rules/effect-patterns.md` - Effect coding standards
- `.claude/rules/general.md` - Architecture boundaries
- `tooling/testkit/src/playwright/` - Target module implementation
- `tooling/testkit/test/playwright/page.test.ts` - Example usage

### Success Criteria for Phase 2

- [ ] Each legacy test file scored for guideline compliance
- [ ] Architecture decisions documented and validated
- [ ] Clear migration order established
- [ ] Blockers identified and mitigation planned
