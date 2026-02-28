# Handoff P5

## Objective

Produce final rollout recommendation with explicit go/limited-go/no-go verdict and rollback triggers.

## Inputs

- `specs/pending/ast-codebase-kg-visualizer/outputs/p4-performance-and-e2e-validation.md`
- `specs/pending/ast-codebase-kg-visualizer/RUBRICS.md`
- `specs/pending/ast-codebase-kg-visualizer/REFLECTION_LOG.md`

## Output

- `specs/pending/ast-codebase-kg-visualizer/outputs/p5-rollout-decision.md`

## Command and Evidence Contract

| Command ID | Command | Evidence Artifact |
|---|---|---|
| P5-C01 | `jq '.phases' specs/pending/ast-codebase-kg-visualizer/outputs/manifest.json` | `specs/pending/ast-codebase-kg-visualizer/outputs/evidence/p5/phase-status-audit.log` |
| P5-C02 | `rg -n "GO|LIMITED GO|NO GO|rollback|trigger" specs/pending/ast-codebase-kg-visualizer/outputs/p5-rollout-decision.md` | `specs/pending/ast-codebase-kg-visualizer/outputs/evidence/p5/decision-contract-audit.log` |
| P5-C03 | `bun run agents:pathless:check` | `specs/pending/ast-codebase-kg-visualizer/outputs/evidence/p5/agents-pathless-check.log` |

## Completion Checklist

- [ ] Gate-by-gate verdict matrix is complete.
- [ ] Rollout stages and owners are explicit.
- [ ] Rollback triggers and actions are explicit.
- [ ] `outputs/manifest.json` updated (`phases.p5.status`, `updated`).
