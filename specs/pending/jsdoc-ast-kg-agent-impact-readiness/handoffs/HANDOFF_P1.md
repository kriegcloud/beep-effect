# Handoff P1

## Objective

Lock the JSDoc governance contract required for high-confidence semantic edges.

## Output Path Contract

All phase outputs and evidence artifacts are repo-root relative.

Canonical output root:
`specs/pending/jsdoc-ast-kg-agent-impact-readiness/outputs`

## Inputs

- `specs/pending/jsdoc-ast-kg-agent-impact-readiness/outputs/p0-baseline-and-gates.md`
- repo lint/jsdoc configuration

## Output

- `specs/pending/jsdoc-ast-kg-agent-impact-readiness/outputs/p1-jsdoc-governance.md`

## Entry Criteria

- [ ] P0 output exists at canonical path.
- [ ] P0 status marked complete in `manifest.json`.
- [ ] P0 output includes explicit command/evidence mapping and blocked-metric policy.

## Command and Evidence Contract

| Command ID | Command | Evidence Artifact |
|---|---|---|
| P1-C01 | `bun run beep docs laws` | `specs/pending/jsdoc-ast-kg-agent-impact-readiness/outputs/evidence/p1/discovery-laws.log` |
| P1-C02 | `bun run beep docs skills` | `specs/pending/jsdoc-ast-kg-agent-impact-readiness/outputs/evidence/p1/discovery-skills.log` |
| P1-C03 | `bun run beep docs policies` | `specs/pending/jsdoc-ast-kg-agent-impact-readiness/outputs/evidence/p1/discovery-policies.log` |
| P1-C04 | `bun run lint:jsdoc` | `specs/pending/jsdoc-ast-kg-agent-impact-readiness/outputs/evidence/p1/lint-jsdoc.log` |
| P1-C05 | `bun run agents:pathless:check` | `specs/pending/jsdoc-ast-kg-agent-impact-readiness/outputs/evidence/p1/agents-pathless-check.log` |
| P1-C06 | `rg -n "@category|@module|@domain|@provides|@depends|@errors|stale-doc|scope rollout" specs/pending/jsdoc-ast-kg-agent-impact-readiness/outputs/p1-jsdoc-governance.md` | `specs/pending/jsdoc-ast-kg-agent-impact-readiness/outputs/evidence/p1/p1-contract-audit.log` |

## Completion Checklist

- [ ] Required tags are scoped and unambiguous.
- [ ] Lint enforcement path is defined.
- [ ] Stale-doc detection criteria are defined.
- [ ] Command/evidence artifacts captured for P1-C01..P1-C06.
- [ ] `specs/pending/jsdoc-ast-kg-agent-impact-readiness/outputs/manifest.json` updated (`phases.p1.status`, `updated`).
