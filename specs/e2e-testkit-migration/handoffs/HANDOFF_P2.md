# Phase 2 → Phase 3 Handoff

## Phase 2 Summary

**Completed**: 2026-01-22
**Duration**: ~2 hours
**Agents Used**: code-reviewer (x2), architecture-pattern-enforcer

### Evaluation Outputs Created

- [x] `outputs/guideline-review.md` - Compliance scoring
- [x] `outputs/architecture-review.md` - Pattern validation

### Verification Table

| Artifact | Status | Verification Command |
|----------|--------|---------------------|
| `outputs/guideline-review.md` | [x] Created | `test -f outputs/guideline-review.md && echo "OK"` |
| `outputs/architecture-review.md` | [x] Created | `test -f outputs/architecture-review.md && echo "OK"` |
| Compliance scores documented | [x] Complete | `grep -c "/10" outputs/guideline-review.md` |
| Violations with file:line refs | [x] Complete | `grep -E ":[0-9]+" outputs/guideline-review.md \| wc -l` |
| REFLECTION_LOG updated | [x] Complete | `grep -c "Phase 2" REFLECTION_LOG.md` |

### Compliance Scores

| File | Effect Patterns | Error Handling | Resource Mgmt | Framework | Overall |
|------|-----------------|----------------|---------------|-----------|---------|
| `smoke.e2e.ts` | 0/10 | 0/10 | 0/10 | 0/10 | **0/40** |
| `flexlayout.e2e.ts` | 0/10 | 0/10 | 0/10 | 0/10 | **0/40** |
| `utils/helpers.ts` | 0/10 | 0/10 | 0/10 | 0/10 | **0/40** |
| `fixtures/auth.setup.ts` | 0/10 | 10/10 | 0/10 | 0/10 | **10/40** |
| `fixtures/base.fixture.ts` | 0/10 | 10/10 | 0/10 | 0/10 | **10/40** |

**Overall**: 0% compliance. Complete rewrite required.

### Guideline Violations Found (Key Examples)

1. **Violation**: All files use named imports from `@playwright/test`
   - **Lines**: `smoke.e2e.ts:1`, `flexlayout.e2e.ts:1`, `helpers.ts:1`
   - **Rule**: Use namespace imports for Effect modules
   - **Fix**: Replace with `@beep/testkit` imports

2. **Violation**: 13 untyped `throw new Error()` statements
   - **Lines**: `helpers.ts:98,111,128,138,153`, `flexlayout.e2e.ts:240,249,263,271,303,311,503,527,558`
   - **Rule**: Use Effect error channels with typed errors
   - **Fix**: Create `BoundingBoxNotFound` and similar typed errors

3. **Violation**: 47 async/await patterns without Effect Scope
   - **Lines**: All test functions in `flexlayout.e2e.ts`
   - **Rule**: Use Effect resource management (acquireRelease)
   - **Fix**: Convert to `Effect.fn()` with `yield*`

4. **Violation**: 1 `waitForTimeout(500)` anti-pattern
   - **Line**: `flexlayout.e2e.ts:614`
   - **Rule**: Use condition-based waiting
   - **Fix**: Replace with `Effect.retry` with Schedule

### Architecture Decisions Made

| Decision | Rationale | Alternatives Considered |
|----------|-----------|------------------------|
| Use `layer()` for test suites | Shares browser across tests | `effect()` would create new browser per test |
| **Only `PlaywrightBrowser` injectable** | Testkit API design - Page/Locator created from browser | Assuming Page/Locator injectable (WRONG) |
| Pass `PlaywrightPage.Service` to helpers | Direct service access, no injection | Service injection via Context (rejected - not supported) |
| Use selectors in helpers, not Locators | Simpler API, locators created inside helper | Pre-create locators (rejected - more complex) |
| Avoid `page.use()` escape hatch | Mouse ops already Effect-wrapped | Use escape hatch for all raw API access (rejected - unnecessary) |

### CRITICAL ARCHITECTURE CORRECTION

**Phase 1 proposed (WRONG)**:
```typescript
const page = yield* PlaywrightPage;      // WRONG - not injectable
const locator = yield* PlaywrightLocator; // WRONG - not injectable
```

**Phase 2 corrected (RIGHT)**:
```typescript
const browser = yield* PlaywrightBrowser; // ONLY injectable service
const page = yield* browser.newPage();    // Page created from browser
const locator = page.locator(".btn");     // Locator created from page
```

### Risk Assessment Summary

| File | Risk Level | Complexity | Key Risks |
|------|------------|------------|-----------|
| `smoke.e2e.ts` | LOW | 8 | None |
| `utils/helpers.ts` | MEDIUM | 1,485 | Mouse timing, coordinate precision |
| `flexlayout.e2e.ts` | CRITICAL | 21,665 | 15 timing deps, 12 state deps, 60+ mouse ops |

**Estimated Migration Effort**: 127 hours (~16 days)

### Recommended Migration Order

1. **Delete unused fixtures** (immediate)
   - `fixtures/auth.setup.ts`
   - `fixtures/base.fixture.ts`

2. **smoke.e2e.ts** (pilot - 8 lines, 1 test)
   - Validates Effect test infrastructure works
   - Establishes import patterns

3. **utils/helpers.ts** (dependency - 165 lines, 9 functions)
   - Required by flexlayout tests
   - Migrate all 9 helper functions to Effect

4. **flexlayout.e2e.ts** (complex - 619 lines, 35 tests)
   - Migrate by describe block (8 groups)
   - Group 1: Simple drag (6 tests)
   - Group 2: Multi-tab (3 tests)
   - Group 3: Border (4 tests)
   - Group 4: Splitter (6 tests)
   - Group 5: Tab management (8 tests)
   - Group 6: Maximize (2 tests)
   - Group 7: Drag rect (3 tests)
   - Group 8: Persistence (2 tests)

### Blockers Identified

| Blocker | Severity | Mitigation |
|---------|----------|------------|
| None blocking | N/A | N/A |

### Risks Requiring Mitigation

| Risk | Severity | Mitigation Strategy |
|------|----------|---------------------|
| `waitForTimeout(500)` | HIGH | Replace with condition-based waiting |
| Coordinate-based mouse ops | MEDIUM | Add viewport normalization Layer |
| Implicit `beforeEach` state | MEDIUM | Use explicit Layer composition |

### Questions Answered

1. **Q: What is the recommended migration order?**
   A: Delete fixtures → smoke.e2e.ts → helpers.ts → flexlayout.e2e.ts by group

2. **Q: Are there any blocking issues?**
   A: No blockers. Architecture correction needed but not blocking.

3. **Q: What patterns for complex drag operations?**
   A: Pass `PlaywrightPage.Service` + selectors, use Effect-wrapped mouse ops directly

4. **Q: How should authentication fixtures be handled?**
   A: Delete (unused). If needed later, create as Effect Layer.

5. **Q: Can old and new tests coexist during migration?**
   A: Yes. Effect tests use `bun:test`, Playwright tests use `@playwright/test`.

---

## Context for Phase 3 Agent

### Starting Point

You are beginning Phase 3 (Synthesis) of the e2e testkit migration. Phases 1-2 have completed discovery and evaluation. All outputs are available in `outputs/`.

**Key Finding**: The Phase 1 architecture proposal had critical flaws (assuming Page/Locator injectable). The corrected architecture is documented in `outputs/architecture-review.md`.

### Your Tasks

1. Read all Phase 1-2 outputs in `outputs/`:
   - `codebase-context.md` (Phase 1)
   - `effect-research.md` (Phase 1)
   - `guideline-review.md` (Phase 2)
   - `architecture-review.md` (Phase 2)

2. Use `reflector` agent to consolidate learnings

3. Create `outputs/meta-reflection-synthesis.md` with:
   - Universal patterns (apply to all migrations)
   - Spec-specific patterns (e2e + Playwright specific)
   - Corrected conversion patterns

4. Validate `MASTER_ORCHESTRATION.md`:
   - Update architecture examples with corrections
   - Verify migration phases align with risk assessment
   - Update helper function signatures

5. Document your findings in `handoffs/HANDOFF_P3.md`

### Key Insights to Synthesize

- **Service injection model**: Only `PlaywrightBrowser` injectable
- **Helper function pattern**: Pass service instances, use selectors
- **Risk mitigation**: Layer composition for state, Effect.retry for timing
- **Escape hatch usage**: Minimal - most operations already Effect-wrapped

### Success Criteria for Phase 3

- [ ] Meta-reflection document created
- [ ] MASTER_ORCHESTRATION.md updated with architecture corrections
- [ ] Helper function signatures corrected in examples
- [ ] Clear implementation steps for each file/group
- [ ] Rollback strategy documented
- [ ] Ready for implementation phase
