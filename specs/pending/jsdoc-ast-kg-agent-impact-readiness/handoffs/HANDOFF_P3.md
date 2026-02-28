# Handoff P3

## Objective

Measure semantic coverage and semantic edge quality using labeled data.

## Output Path Contract

All phase outputs and evidence artifacts are repo-root relative.

Canonical output root:
`specs/pending/jsdoc-ast-kg-agent-impact-readiness/outputs`

## Inputs

- `specs/pending/jsdoc-ast-kg-agent-impact-readiness/outputs/p1-jsdoc-governance.md`
- labeled module and edge set

## Output

- `specs/pending/jsdoc-ast-kg-agent-impact-readiness/outputs/p3-semantic-coverage.md`

## Entry Criteria

- [ ] P1 output exists at canonical path.
- [ ] P2 reliability output exists and confirms no-throw fallback behavior.
- [ ] Labeled module and edge set location is frozen before measurement starts.

## Command and Evidence Contract

| Command ID | Command | Evidence Artifact |
|---|---|---|
| P3-C01 | `bun run beep docs laws` | `specs/pending/jsdoc-ast-kg-agent-impact-readiness/outputs/evidence/p3/discovery-laws.log` |
| P3-C02 | `bun run beep docs skills` | `specs/pending/jsdoc-ast-kg-agent-impact-readiness/outputs/evidence/p3/discovery-skills.log` |
| P3-C03 | `bun run beep docs policies` | `specs/pending/jsdoc-ast-kg-agent-impact-readiness/outputs/evidence/p3/discovery-policies.log` |
| P3-C04 | `bun run agents:pathless:check` | `specs/pending/jsdoc-ast-kg-agent-impact-readiness/outputs/evidence/p3/agents-pathless-check.log` |
| P3-C05 | `rg -n "parse success|precision|recall|denominator|coverage|@domain|@provides|@depends|@errors" specs/pending/jsdoc-ast-kg-agent-impact-readiness/outputs/p3-semantic-coverage.md` | `specs/pending/jsdoc-ast-kg-agent-impact-readiness/outputs/evidence/p3/p3-contract-audit.log` |

## Completion Checklist

- [ ] Parse success measured.
- [ ] Precision measured.
- [ ] Recall measured.
- [ ] Coverage map included.
- [ ] Command/evidence artifacts captured for P3-C01..P3-C05.
- [ ] `specs/pending/jsdoc-ast-kg-agent-impact-readiness/outputs/manifest.json` updated (`phases.p3.status`, `updated`).
