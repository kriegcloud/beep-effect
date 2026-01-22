# Phase 2 Orchestrator Prompt

Copy-paste this prompt to start Phase 2 (Evaluation) execution.

---

## Pre-Flight Checklist

Before executing this phase, verify Phase 1 artifacts exist:
- [ ] `outputs/codebase-context.md` exists (Phase 1 artifact)
- [ ] `outputs/effect-research.md` exists (Phase 1 artifact)
- [ ] `REFLECTION_LOG.md` contains Phase 1 learnings
- [ ] Test inventory counts are verifiable via grep

If Phase 1 artifacts are missing or incomplete, request regeneration before proceeding.

---

## Prompt

You are executing Phase 2 (Evaluation) of the E2E Testkit Migration spec.

### Context

Phase 1 has completed discovery. We now have a catalog of existing tests and Effect patterns. This phase evaluates compliance with guidelines and validates the proposed migration architecture.

### Your Mission

Evaluate current e2e tests against Effect coding standards and validate the proposed migration architecture.

### Deliverables

1. `specs/e2e-testkit-migration/outputs/guideline-review.md`
2. `specs/e2e-testkit-migration/outputs/architecture-review.md`

### Evaluation Tasks

**Task 2.1: Guideline Compliance Review**
Delegate to `code-reviewer`:
```
Evaluate current e2e tests against .claude/rules/effect-patterns.md

Files to review:
- e2e/smoke.e2e.ts
- e2e/flexlayout.e2e.ts
- e2e/utils/helpers.ts

Score each file on:
1. Namespace imports (currently using named imports) - /10
2. Error handling (try/catch vs Effect error channels) - /10
3. Resource management (browser lifecycle) - /10
4. Testing framework (@playwright/test vs @beep/testkit) - /10

Document specific violations with file:line references.

Output: Compliance scorecard per file with violation list.
```

**Task 2.2: Architecture Validation**
Delegate to `architecture-pattern-enforcer`:
```
Validate proposed migration architecture.

Evaluate:
1. PlaywrightEnvironment.layer() composition
   - Is layer creation correct?
   - Does browser type injection work?

2. Service tag usage
   - PlaywrightPage service injection
   - PlaywrightLocator service patterns
   - PlaywrightBrowser lifecycle

3. Test organization
   - layer() vs effect() usage
   - it.scoped() for browser tests
   - withBrowser decorator pattern

4. Helper function patterns
   - Effect-returning signatures
   - Service injection vs parameter passing

Reference: tooling/testkit/test/playwright/page.test.ts

Output: Architecture validation report with recommendations.
```

**Task 2.3: Risk Assessment**
Delegate to `code-reviewer`:
```
Assess migration risks for each file.

Risk categories:
1. Complexity risk (high LOC, many tests)
2. Timing risk (async operations, waits)
3. State risk (shared state between tests)
4. Dependency risk (external services, fixtures)

For each file:
- Overall risk level (High/Medium/Low)
- Specific risks identified
- Mitigation strategies

Output: Risk matrix with mitigation strategies.
```

### Output Format

Each deliverable should include:
- **Executive Summary**: Key findings (2-3 sentences)
- **Compliance Scorecard**: Scores per dimension per file
- **Violation Details**: File:line references for each issue
- **Architecture Recommendations**: Validated patterns to use
- **Risk Assessment**: Matrix with mitigation strategies

### Compliance Scoring Guide

| Score | Meaning |
|-------|---------|
| 10/10 | Fully compliant, no changes needed |
| 7-9/10 | Minor issues, simple fixes |
| 4-6/10 | Significant issues, moderate rework |
| 1-3/10 | Major violations, substantial changes |

### Reference Files

| File | Purpose |
|------|---------|
| `.claude/rules/effect-patterns.md` | Effect coding standards |
| `.claude/rules/general.md` | Architecture boundaries |
| `tooling/testkit/src/playwright/` | Target module implementation |
| `tooling/testkit/test/playwright/page.test.ts` | Example usage |
| `outputs/codebase-context.md` | Phase 1 test inventory |
| `outputs/effect-research.md` | Phase 1 pattern research |

### Success Criteria

- [ ] `outputs/guideline-review.md` created with compliance scores
- [ ] `outputs/architecture-review.md` created with validation results
- [ ] Each file scored on all 4 dimensions
- [ ] All violations have file:line references
- [ ] Architecture decisions documented with rationale
- [ ] Migration order recommended (simplest → complex)
- [ ] Blockers identified with mitigation plans
- [ ] `REFLECTION_LOG.md` updated with Phase 2 learnings

### Questions to Answer

1. What is the recommended migration order?
2. Are there any blocking issues?
3. What patterns should be used for complex drag operations?
4. How should authentication fixtures be handled?
5. Can old and new tests coexist during migration?

### Handoff Document

Full context: `specs/e2e-testkit-migration/handoffs/HANDOFF_P2.md`

### Next Steps

After completing Phase 2:
1. Update `specs/e2e-testkit-migration/REFLECTION_LOG.md` with learnings
2. Update `specs/e2e-testkit-migration/handoffs/HANDOFF_P2.md` with summary
3. Proceed to Phase 3 using `P3_ORCHESTRATOR_PROMPT.md`
