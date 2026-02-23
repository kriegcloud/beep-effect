# codex-claude-parity: Evaluation Rubrics

> Quantitative grading model for operational parity between `.claude` and `.codex`.

---

## Scoring Model

Overall score is weighted across five categories.

| Category | Weight | Purpose |
|----------|--------|---------|
| Capability Coverage | 35% | Required source capabilities are available in Codex workflows |
| Behavioral Fidelity | 20% | Safety and coding constraints remain aligned with project standards |
| Workflow Parity | 20% | End-to-end task execution is equivalent in practice |
| Verification Quality | 15% | Validation evidence is reproducible and complete |
| Documentation Quality | 10% | Spec docs and handoffs are clear, current, and actionable |

Formula:

`overall = sum((category_score / 5) * category_weight)`

---

## Grade Bands

| Overall Score | Grade | Interpretation |
|---------------|-------|----------------|
| 90-100 | A | Production-ready parity |
| 80-89 | B | Strong parity with minor residuals |
| 70-79 | C | Functional but material gaps remain |
| 60-69 | D | High risk; rework required |
| <60 | F | Not acceptable |

Minimum acceptance gate:

- Overall >= 90
- Capability Coverage >= 4/5
- Workflow Parity >= 4/5
- No unresolved critical blockers

---

## Category Rubrics

## 1) Capability Coverage (35%)

### Dimension Breakdown

| Dimension | Weight Inside Category |
|-----------|------------------------|
| Instruction parity | 25% |
| Skill parity | 30% |
| Command/workflow parity | 25% |
| Context/discoverability parity | 20% |

### Scoring Guide

| Score | Criteria |
|-------|----------|
| 5 | All required capabilities mapped and implemented or approved adaptation |
| 4 | 1-2 low-risk required gaps with mitigation |
| 3 | Several required gaps, mitigations incomplete |
| 2 | Major capability domains partially missing |
| 1 | Required capability mapping incomplete |

Evidence sources:

- `outputs/parity-capability-matrix.md`
- `outputs/P1_GAP_ANALYSIS.md`
- `outputs/parity-decision-log.md`

---

## 2) Behavioral Fidelity (20%)

### What is measured

- Safety constraints preserved
- Repo workflow guardrails preserved
- No contradictory instructions introduced
- Risk management behavior remains explicit

### Scoring Guide

| Score | Criteria |
|-------|----------|
| 5 | Codex guidance aligns with all critical repo guardrails |
| 4 | Minor wording drift, no behavioral conflict |
| 3 | One moderate conflict or omission |
| 2 | Multiple conflicting instruction areas |
| 1 | Unsafe or contradictory guidance |

Evidence sources:

- `.codex/**` instruction files
- `.claude/**` source guidance
- `outputs/P2_IMPLEMENTATION_REPORT.md`

---

## 3) Workflow Parity (20%)

### Required Scenarios

| Scenario ID | Required |
|-------------|----------|
| S1: Spec bootstrap + handoff pair generation | Yes |
| S2: Code edit + verification command sequence | Yes |
| S3: Review workflow with severity-ordered findings | Yes |
| S4: Session handoff and clean resume | Yes |
| S5: Symlink portability + fallback behavior | Yes |

### Scoring Guide

| Score | Criteria |
|-------|----------|
| 5 | All required scenarios pass with reproducible evidence |
| 4 | All pass with one minor reproducibility issue |
| 3 | One required scenario partially fails |
| 2 | Multiple required scenarios fail |
| 1 | Validation not executed |

Evidence sources:

- `outputs/P3_VALIDATION_REPORT.md`
- `outputs/parity-scorecard.md`

---

## 4) Verification Quality (15%)

### What is measured

- Command evidence is concrete
- Expected vs actual outcomes are documented
- Failures have root-cause and mitigation
- Re-run instructions are present

### Scoring Guide

| Score | Criteria |
|-------|----------|
| 5 | Full reproducible evidence with command-level trace |
| 4 | Strong evidence, minor missing trace details |
| 3 | Partial trace, missing rerun clarity |
| 2 | Sparse evidence |
| 1 | No verification evidence |

---

## 5) Documentation Quality (10%)

### What is measured

- Docs are current and consistent
- Handoff protocol followed
- Reflection log includes concrete learnings
- No stale references

### Scoring Guide

| Score | Criteria |
|-------|----------|
| 5 | Clear, current, and complete across all required docs |
| 4 | Minor clarity gaps |
| 3 | Several stale or ambiguous sections |
| 2 | Incomplete/fragmented docs |
| 1 | Missing critical docs |

---

## Critical Failure Conditions

Any critical failure condition overrides total score and results in FAIL.

- Required capability has no mapping and no approved defer rationale
- `.codex` guidance conflicts with project safety constraints
- Scenario validation artifacts do not show executed evidence
- Required handoff pair missing for completed phase
- Symlink usage is required for parity but no fallback behavior is defined for non-portable environments

---

## Scoring Worksheet

Use this template in `outputs/parity-scorecard.md`.

```markdown
| Category | Weight | Score (1-5) | Weighted Contribution | Evidence |
|----------|--------|-------------|-----------------------|----------|
| Capability Coverage | 35 | X | X | link |
| Behavioral Fidelity | 20 | X | X | link |
| Workflow Parity | 20 | X | X | link |
| Verification Quality | 15 | X | X | link |
| Documentation Quality | 10 | X | X | link |
| **Total** | **100** | - | **X** | - |
```

---

## Scenario Evaluation Template

```markdown
## Scenario S#

### Objective
[what is being validated]

### Procedure
1. [step]
2. [step]

### Evidence
- Command: `...`
- Key output: `...`

### Result
- Status: PASS/FAIL
- Notes:

### Follow-up
- [action if failed]
```

---

## Review Cadence

Apply rubric at:

- End of P1 (analysis quality checkpoint)
- End of P2 (implementation quality checkpoint)
- End of P3 (formal parity gate)
- End of P4 (final score)

---

## Example High-Quality Outcomes

### Example A: Score 94

- Coverage: 5
- Fidelity: 4
- Workflow: 5
- Verification: 5
- Documentation: 4

Outcome:

- Accepted, minor documentation cleanup deferred

### Example B: Score 82

- Coverage: 4
- Fidelity: 4
- Workflow: 3
- Verification: 4
- Documentation: 4

Outcome:

- Not accepted due to Workflow Parity < 4

---

## Required Cross-Checks

Before claiming completion, validate:

- `README.md` success criteria and rubric pass criteria agree
- Handoff files exist for each completed phase
- Reflection log includes latest phase decisions
- Decision log explains all non-direct parity mappings
