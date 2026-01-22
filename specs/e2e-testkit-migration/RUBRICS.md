# Evaluation Rubrics: E2E Testkit Migration

> Criteria for evaluating each phase of the e2e testkit migration spec.

---

## Phase 1: Discovery

### Completeness (40%)

| Score | Criteria |
|-------|----------|
| 4 | All test files cataloged; all patterns identified; all dependencies mapped |
| 3 | Most files cataloged; minor gaps in pattern extraction |
| 2 | Significant files missing; incomplete dependency mapping |
| 1 | Major gaps in inventory; only partial coverage |

### Accuracy (30%)

| Score | Criteria |
|-------|----------|
| 4 | Line counts verifiable; test counts accurate; pattern examples correct |
| 3 | Minor inaccuracies in counts |
| 2 | Some incorrect counts or misidentified patterns |
| 1 | Significant errors in pattern identification |

### Pattern Documentation (30%)

| Score | Criteria |
|-------|----------|
| 4 | All Playwright patterns documented with conversion mappings |
| 3 | Most patterns documented; some mappings missing |
| 2 | Major patterns found; conversion guidance incomplete |
| 1 | Pattern documentation insufficient for migration |

---

## Phase 2: Evaluation

### Compliance Scoring (30%)

| Score | Criteria |
|-------|----------|
| 4 | All files scored on all 4 dimensions with file:line violations |
| 3 | All files scored; some violations lack references |
| 2 | Incomplete scoring; missing dimensions |
| 1 | Scoring incomplete or inaccurate |

### Architecture Validation (30%)

| Score | Criteria |
|-------|----------|
| 4 | All patterns validated against testkit examples; clear recommendations |
| 3 | Most patterns validated; minor gaps |
| 2 | Significant validation gaps |
| 1 | Architecture not properly validated |

### Risk Assessment (20%)

| Score | Criteria |
|-------|----------|
| 4 | All files assessed; risks categorized with mitigations |
| 3 | Most risks identified; some mitigations missing |
| 2 | Major risks found; mitigation strategies incomplete |
| 1 | Risk assessment insufficient |

### Migration Planning (20%)

| Score | Criteria |
|-------|----------|
| 4 | Clear migration order with rationale; dependencies considered |
| 3 | Migration order provided; minor gaps in rationale |
| 2 | Order unclear; dependencies not fully considered |
| 1 | No clear migration plan |

---

## Phase 3: Synthesis

### Learning Consolidation (30%)

| Score | Criteria |
|-------|----------|
| 4 | Universal and spec-specific learnings clearly separated; actionable |
| 3 | Learnings documented; separation could be clearer |
| 2 | Learnings present but not well organized |
| 1 | Insufficient learning capture |

### Plan Validation (30%)

| Score | Criteria |
|-------|----------|
| 4 | MASTER_ORCHESTRATION validated against findings; updates applied |
| 3 | Plan mostly validated; minor discrepancies |
| 2 | Significant plan gaps not addressed |
| 1 | Plan not validated against findings |

### Implementation Readiness (40%)

| Score | Criteria |
|-------|----------|
| 4 | Detailed checklist per file; clear success criteria; rollback documented |
| 3 | Checklists present; some criteria missing |
| 2 | Implementation guidance incomplete |
| 1 | Phase 4 cannot proceed from current state |

---

## Phase 4: Implementation

### Code Quality (30%)

| Score | Criteria |
|-------|----------|
| 4 | Fully compliant with Effect patterns; proper namespace imports |
| 3 | Minor pattern deviations; mostly compliant |
| 2 | Significant pattern issues; needs cleanup |
| 1 | Code does not follow Effect patterns |

### Test Coverage (25%)

| Score | Criteria |
|-------|----------|
| 4 | All original tests migrated; no test loss |
| 3 | All tests migrated; minor assertion changes |
| 2 | Some tests not migrated or broken |
| 1 | Significant test coverage loss |

### Migration Completeness (25%)

| Score | Criteria |
|-------|----------|
| 4 | No @playwright/test imports; all helpers Effect-wrapped |
| 3 | Minimal legacy imports; most helpers converted |
| 2 | Significant legacy code remains |
| 1 | Migration incomplete |

### Verification (20%)

| Score | Criteria |
|-------|----------|
| 4 | All verification commands pass (test:e2e, check, lint) |
| 3 | Tests pass; minor lint issues |
| 2 | Some tests failing or type errors |
| 1 | Verification commands fail |

---

## Cross-Phase Rubrics

### Handoff Quality

| Score | Criteria |
|-------|----------|
| 4 | Both HANDOFF and ORCHESTRATOR_PROMPT created; complete context preserved |
| 3 | Both files created; minor context gaps |
| 2 | Only one file created; or significant context missing |
| 1 | No handoff files; or files incomplete |

### Reflection Quality

| Score | Criteria |
|-------|----------|
| 4 | Rich phase learnings documented; prompt improvements suggested |
| 3 | Phase learnings documented; improvements noted |
| 2 | Basic learnings only; no prompt improvements |
| 1 | Reflection not updated or empty |

### Agent Delegation

| Score | Criteria |
|-------|----------|
| 4 | Correct agents used for each task; clear prompts provided |
| 3 | Most delegation correct; some prompt refinements needed |
| 2 | Some incorrect agent choices; prompts unclear |
| 1 | Poor delegation; agents not utilized effectively |

---

## Deliverable Checklist

### Phase 1 Outputs

| Deliverable | Required | Verification |
|-------------|----------|--------------|
| `outputs/codebase-context.md` | Yes | Contains test inventory with counts |
| `outputs/effect-research.md` | Yes | Contains pattern mappings |
| `REFLECTION_LOG.md` update | Yes | Phase 1 section populated |
| `handoffs/HANDOFF_P1.md` update | Yes | Summary of findings |

### Phase 2 Outputs

| Deliverable | Required | Verification |
|-------------|----------|--------------|
| `outputs/guideline-review.md` | Yes | Compliance scores per file |
| `outputs/architecture-review.md` | Yes | Pattern validation results |
| `REFLECTION_LOG.md` update | Yes | Phase 2 section populated |
| `handoffs/HANDOFF_P2.md` update | Yes | Evaluation summary |

### Phase 3 Outputs

| Deliverable | Required | Verification |
|-------------|----------|--------------|
| `outputs/meta-reflection-synthesis.md` | Yes | Consolidated learnings |
| `MASTER_ORCHESTRATION.md` | Yes | Validated/updated |
| `REFLECTION_LOG.md` update | Yes | Phase 3 section populated |
| `handoffs/HANDOFF_P3.md` finalized | Yes | Implementation ready |

### Phase 4 Outputs

| Deliverable | Required | Verification |
|-------------|----------|--------------|
| Migrated `smoke.e2e.ts` | Yes | Test passes |
| Migrated `helpers.ts` | Yes | Type check passes |
| Migrated `flexlayout.e2e.ts` | Yes | All tests pass |
| `REFLECTION_LOG.md` finalized | Yes | All phases documented |

---

## Overall Scoring

### Phase Completion Threshold

| Rating | Score Range | Meaning |
|--------|-------------|---------|
| Excellent | 3.5 - 4.0 | Phase complete, ready for next phase |
| Good | 2.5 - 3.4 | Minor issues, can proceed with notes |
| Needs Work | 1.5 - 2.4 | Significant gaps, rework required |
| Unsatisfactory | < 1.5 | Phase not complete, major rework |

### Spec Completion Criteria

The spec is complete when:

- [ ] Phase 1 score >= 3.0
- [ ] Phase 2 score >= 3.0
- [ ] Phase 3 score >= 3.5
- [ ] Phase 4 score >= 3.5
- [ ] All tests pass: `bun run test:e2e`
- [ ] Type check passes: `bun run check`
- [ ] Lint passes: `bun run lint`
- [ ] No `@playwright/test` imports remain
- [ ] `REFLECTION_LOG.md` complete with all phases

---

## Quality Gates

### Phase 1 → Phase 2 Gate

Cannot proceed unless:
- [ ] All test files cataloged
- [ ] Pattern mappings documented
- [ ] Effect research complete
- [ ] Handoff files created

### Phase 2 → Phase 3 Gate

Cannot proceed unless:
- [ ] Compliance scores per file
- [ ] Architecture validated
- [ ] Migration order determined
- [ ] Handoff files created

### Phase 3 → Phase 4 Gate

Cannot proceed unless:
- [ ] Learnings synthesized
- [ ] Plan validated against findings
- [ ] Implementation checklist per file
- [ ] Rollback strategy documented

### Phase 4 → Complete Gate

Cannot mark complete unless:
- [ ] All tests migrated
- [ ] All verification commands pass
- [ ] No legacy imports
- [ ] Documentation updated
- [ ] REFLECTION_LOG finalized

---

## Anti-Pattern Detection

### Red Flags (Score = 0)

| Anti-Pattern | Detection |
|--------------|-----------|
| Empty outputs | File exists but < 10 lines |
| No file:line refs | Violations lack specific references |
| Untested migration | Tests not run after changes |
| Missing handoff | Either HANDOFF or ORCHESTRATOR_PROMPT missing |
| Static reflection | REFLECTION_LOG not updated per phase |

### Warnings (Score Penalty)

| Warning | Penalty |
|---------|---------|
| Unverifiable counts | -0.5 from Accuracy |
| Missing pattern mappings | -0.5 from Completeness |
| Incomplete risk assessment | -0.5 from Risk Assessment |
| Test failures ignored | -1.0 from Verification |

---

## Migration Quality Checklist

### Per-File Quality Check

For each migrated file, verify:

```bash
# 1. No legacy imports
grep -c "@playwright/test" <file>
# Expected: 0

# 2. Uses testkit imports
grep -c "@beep/testkit" <file>
# Expected: > 0

# 3. Uses Effect patterns
grep -c "Effect.fn" <file>
grep -c "yield\\*" <file>
# Expected: > 0 for test files

# 4. Type check
bun run check

# 5. Tests pass
bun run test:e2e --grep "<file-pattern>"
```

### Final Migration Verification

```bash
# No @playwright/test imports in e2e/
find e2e -name "*.ts" -exec grep -l "@playwright/test" {} \;
# Expected: no output

# All checks pass
bun run test:e2e && bun run check && bun run lint
# Expected: all pass

# Tests count matches original
bun run test:e2e --list
# Expected: same test count as original
```
