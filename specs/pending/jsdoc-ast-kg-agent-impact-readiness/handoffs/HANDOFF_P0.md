# Handoff P0

## Objective

Freeze all evaluation gates and measurement contracts before making implementation claims.

## Output Path Contract

All phase outputs and evidence artifacts are repo-root relative.

Canonical output root:
`specs/pending/jsdoc-ast-kg-agent-impact-readiness/outputs`

## Inputs

- `specs/pending/jsdoc-ast-kg-agent-impact-readiness/outputs/p-pre-kg-cli-refactor-and-ai-sdk.md`
- `specs/pending/jsdoc-ast-kg-agent-impact-readiness/README.md`
- `specs/pending/jsdoc-ast-kg-agent-impact-readiness/RUBRICS.md`
- `specs/pending/jsdoc-ast-kg-agent-impact-readiness/outputs/initial_plan.md`

## Output

- `specs/pending/jsdoc-ast-kg-agent-impact-readiness/outputs/p0-baseline-and-gates.md`

## Entry Criteria

- [ ] PRE output exists at canonical path.
- [ ] PRE phase status is marked complete in `manifest.json`.
- [ ] PRE command/evidence artifacts exist and are traceable.

## Command and Evidence Contract

| Command ID | Command | Evidence Artifact |
|---|---|---|
| P0-C01 | `bun run beep docs laws` | `specs/pending/jsdoc-ast-kg-agent-impact-readiness/outputs/evidence/p0/discovery-laws.log` |
| P0-C02 | `bun run beep docs skills` | `specs/pending/jsdoc-ast-kg-agent-impact-readiness/outputs/evidence/p0/discovery-skills.log` |
| P0-C03 | `bun run beep docs policies` | `specs/pending/jsdoc-ast-kg-agent-impact-readiness/outputs/evidence/p0/discovery-policies.log` |
| P0-C04 | `bun run agents:pathless:check` | `specs/pending/jsdoc-ast-kg-agent-impact-readiness/outputs/evidence/p0/agents-pathless-check.log` |
| P0-C05 | `rg -n "threshold|measurement|evidence|blocked" specs/pending/jsdoc-ast-kg-agent-impact-readiness/outputs/p0-baseline-and-gates.md` | `specs/pending/jsdoc-ast-kg-agent-impact-readiness/outputs/evidence/p0/p0-contract-audit.log` |

## Completion Checklist

- [ ] All metric thresholds locked.
- [ ] Measurement methods documented.
- [ ] Blocked-metric policy defined.
- [ ] Command/evidence artifacts captured for P0-C01..P0-C05.
- [ ] `specs/pending/jsdoc-ast-kg-agent-impact-readiness/outputs/manifest.json` updated (`phases.p0.status`, `updated`).
