# Phase 3 Orchestrator Prompt

Copy-paste this prompt to start Phase 3 (Synthesis) execution.

---

## Pre-Flight Checklist

Before executing this phase, verify Phase 1-2 artifacts exist:
- [ ] `outputs/codebase-context.md` exists (Phase 1)
- [ ] `outputs/effect-research.md` exists (Phase 1)
- [ ] `outputs/guideline-review.md` exists (Phase 2)
- [ ] `outputs/architecture-review.md` exists (Phase 2)
- [ ] `REFLECTION_LOG.md` contains Phase 1-2 learnings

If any artifacts are missing, request regeneration before proceeding.

---

## Prompt

You are executing Phase 3 (Synthesis) of the E2E Testkit Migration spec.

### Context

Phases 1-2 have completed discovery and evaluation. All outputs are available in `outputs/`. This phase consolidates learnings and validates the migration plan before implementation.

### Your Mission

Synthesize all research into actionable insights and validate the `MASTER_ORCHESTRATION.md` migration plan.

### Deliverables

1. `specs/e2e-testkit-migration/outputs/meta-reflection-synthesis.md`
2. Updated `specs/e2e-testkit-migration/MASTER_ORCHESTRATION.md` (if changes needed)

### Synthesis Tasks

**Task 3.1: Consolidate Learnings**
Delegate to `reflector`:
```
Analyze Phase 1-2 outputs and extract actionable insights.

Inputs to analyze:
1. outputs/codebase-context.md
2. outputs/effect-research.md
3. outputs/guideline-review.md
4. outputs/architecture-review.md

Synthesis questions:
1. What patterns from current tests should be preserved?
2. What anti-patterns should be eliminated?
3. What Effect patterns should be emphasized?
4. What conversion patterns were validated?
5. What risks need special attention?

Output: Consolidated insights document with:
- Universal learnings (apply to all migrations)
- Spec-specific learnings (apply to this migration)
- Prompt refinements for Phase 4
```

**Task 3.2: Validate Migration Plan**
Read `MASTER_ORCHESTRATION.md` and verify:
```
Cross-check against Phase 1-2 findings:

1. File list accuracy
   - All test files accounted for?
   - Line counts match inventory?
   - Test counts verified?

2. Pattern mappings
   - Import mapping complete?
   - Async operation mapping covers all cases?
   - Assertion mapping handles all expect() patterns?

3. Migration order
   - Matches risk assessment recommendations?
   - Dependencies considered?

4. Troubleshooting section
   - Covers identified risks?
   - Mitigation strategies included?

Output: Validation checklist with any needed updates.
```

**Task 3.3: Generate Implementation Checklist**
Create detailed implementation steps:
```
For each file to migrate:

smoke.e2e.ts:
- [ ] Replace imports
- [ ] Convert test() to layer()/it.scoped()
- [ ] Update assertions
- [ ] Run verification: bun run test:e2e --grep "smoke"

utils/helpers.ts:
- [ ] Convert each function to Effect signature
- [ ] Update type annotations
- [ ] Run verification: bun run check

flexlayout.e2e.ts (per describe block):
- [ ] functional: 7 tests
- [ ] border panels: 3 tests
- [ ] drag: 7 tests
- [ ] external drag: 3 tests
- [ ] splitters: 4 tests
- [ ] nested tabsets: 5 tests
- [ ] popup: 3 tests
- [ ] maximize: 4 tests
- [ ] action buttons: 5 tests
- [ ] overflow menu: 5 tests
- [ ] serialization: 4 tests
```

### Output Format

**meta-reflection-synthesis.md** structure:
```markdown
# Meta-Reflection Synthesis: E2E Testkit Migration

## Executive Summary
[2-3 sentence overview]

## Universal Learnings
[Patterns applicable to any similar migration]

## Spec-Specific Learnings
[Patterns unique to this e2e migration]

## Validated Conversion Patterns
[Confirmed working patterns from Phase 2]

## Risk Mitigation Summary
[Key risks and their mitigations]

## Phase 4 Preparation
[Specific guidance for implementation phase]
```

### Key Patterns to Validate

| Pattern | Source | Target |
|---------|--------|--------|
| `test()` | `it.scoped()` with `Effect.fn()` |
| `await page.x()` | `yield* page.x()` |
| `expect().toBe()` | `strictEqual()` |
| `page.locator(sel)` | `page.locator(sel)` (returns Service) |
| Complex operations | `page.use()` escape hatch |

### Reference Files

| File | Purpose |
|------|---------|
| All `outputs/*.md` files | Phase 1-2 artifacts |
| `MASTER_ORCHESTRATION.md` | Migration plan to validate |
| `REFLECTION_LOG.md` | Previous learnings |
| `tooling/testkit/test/playwright/page.test.ts` | Reference implementation |

### Success Criteria

- [ ] `outputs/meta-reflection-synthesis.md` created
- [ ] Universal vs spec-specific learnings separated
- [ ] `MASTER_ORCHESTRATION.md` validated or updated
- [ ] Clear implementation steps for each file
- [ ] Rollback strategy documented
- [ ] `REFLECTION_LOG.md` updated with Phase 3 learnings
- [ ] `handoffs/HANDOFF_P3.md` finalized for Phase 4

### Handoff Document

Full context: `specs/e2e-testkit-migration/handoffs/HANDOFF_P3.md`

### Next Steps

After completing Phase 3:
1. Update `specs/e2e-testkit-migration/REFLECTION_LOG.md` with final learnings
2. Finalize `specs/e2e-testkit-migration/handoffs/HANDOFF_P3.md`
3. Proceed to Phase 4 (Implementation) following the validated plan
4. Implementation agents: `test-writer`, `effect-code-writer`, `package-error-fixer`
