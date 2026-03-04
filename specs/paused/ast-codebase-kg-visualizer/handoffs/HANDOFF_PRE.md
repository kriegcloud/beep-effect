# Handoff PRE

## Objective

Align source contracts and freeze immutable KG v1 -> visualizer mapping before architecture freeze work starts.

## Output Path Contract

Canonical output root:
`specs/pending/ast-codebase-kg-visualizer/outputs`

## Inputs

- `specs/pending/ast-codebase-kg-visualizer/README.md`
- `tooling/cli/src/commands/kg.ts`
- `specs/pending/ast-codebase-kg-visualizer/outputs/kg-bundle/README.md`
- `specs/pending/ast-codebase-kg-visualizer/outputs/kg-bundle/sample-graph-v2.json`

## Output

- `specs/pending/ast-codebase-kg-visualizer/outputs/p-pre-contract-and-source-alignment.md`

## Entry Criteria

- [ ] Discovery commands executed (`bun run beep docs laws`, `bun run beep docs skills`, `bun run beep docs policies`).
- [ ] No unresolved source-of-truth ambiguity.

## Command and Evidence Contract

| Command ID | Command | Evidence Artifact |
|---|---|---|
| PRE-C01 | `bun run beep docs laws` | `specs/pending/ast-codebase-kg-visualizer/outputs/evidence/pre/discovery-laws.log` |
| PRE-C02 | `bun run beep docs skills` | `specs/pending/ast-codebase-kg-visualizer/outputs/evidence/pre/discovery-skills.log` |
| PRE-C03 | `bun run beep docs policies` | `specs/pending/ast-codebase-kg-visualizer/outputs/evidence/pre/discovery-policies.log` |
| PRE-C04 | `bun run agents:pathless:check` | `specs/pending/ast-codebase-kg-visualizer/outputs/evidence/pre/agents-pathless-check.log` |
| PRE-C05 | `jq '.meta,.nodes[0],.edges[0]' specs/pending/ast-codebase-kg-visualizer/outputs/kg-bundle/sample-graph-v2.json` | `specs/pending/ast-codebase-kg-visualizer/outputs/evidence/pre/sample-graph-contract.log` |

## Completion Checklist

- [ ] Immutable node mapping table is present.
- [ ] Immutable edge mapping table is present.
- [ ] Fallback behavior and `meta.originalType` policy are explicit.
- [ ] Deterministic ID/provenance carry-through is explicit.
- [ ] `outputs/manifest.json` updated (`phases.pre.status`, `updated`).
