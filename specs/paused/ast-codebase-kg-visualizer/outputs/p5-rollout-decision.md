# P5: Rollout Decision

## Goal

Deliver final rollout recommendation and runbook based on locked gates and collected evidence.

## Required Inputs

1. `specs/pending/ast-codebase-kg-visualizer/outputs/p4-performance-and-e2e-validation.md`
2. `specs/pending/ast-codebase-kg-visualizer/RUBRICS.md`
3. evidence logs under `specs/pending/ast-codebase-kg-visualizer/outputs/evidence/*`

## Output Path

`specs/pending/ast-codebase-kg-visualizer/outputs/p5-rollout-decision.md`

## Gate-by-Gate Verdict Table

| Gate | Status | Evidence | Notes |
|---|---|---|---|
| CLI correctness | TBD | TBD | TBD |
| API correctness | TBD | TBD | TBD |
| UI interaction E2E | TBD | TBD | TBD |
| Sample fixture smoke | TBD | TBD | TBD |
| Large graph responsiveness | TBD | TBD | TBD |

## Recommendation

- Final decision: **TBD (GO / LIMITED GO / NO GO)**

## Rollout Stages

1. Shadow
2. Limited
3. Default

Each stage must include:

- owner
- promotion criteria
- fallback action

## Rollback Triggers

1. Interaction regressions under normal load
2. API contract failures in production logs
3. responsiveness gate regressions

Each trigger must include:

- detection signal
- rollback action
- verification command

## Command and Evidence Matrix

| Command ID | Command | Evidence Artifact |
|---|---|---|
| P5-C01 | phase manifest audit | `outputs/evidence/p5/phase-status-audit.log` |
| P5-C02 | decision contract audit | `outputs/evidence/p5/decision-contract-audit.log` |
| P5-C03 | pathless check | `outputs/evidence/p5/agents-pathless-check.log` |

## Completion Checklist

- [ ] Gate-by-gate verdict table complete.
- [ ] Final recommendation complete.
- [ ] Rollout stages and rollback triggers complete.
- [ ] Manifest phase status updated.
