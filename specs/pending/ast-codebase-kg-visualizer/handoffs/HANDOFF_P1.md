# Handoff P1

## Objective

Produce decision-complete `beep kg export` command design and implementation/test plan.

## Inputs

- `specs/pending/ast-codebase-kg-visualizer/outputs/p0-architecture-and-gates.md`
- `tooling/cli/src/commands/kg.ts`
- `tooling/cli/test/kg.test.ts`
- `specs/pending/ast-codebase-kg-visualizer/outputs/kg-bundle/sample-graph-v2.json`

## Output

- `specs/pending/ast-codebase-kg-visualizer/outputs/p1-kg-export-cli.md`

## Command and Evidence Contract

| Command ID | Command | Evidence Artifact |
|---|---|---|
| P1-C01 | `bun run --cwd tooling/cli test -- kg.test.ts` | `specs/pending/ast-codebase-kg-visualizer/outputs/evidence/p1/kg-cli-test-baseline.log` |
| P1-C02 | `rg -n "IndexMode|KgNode|KgEdge|SnapshotRecord|AstKgNodeV2|AstKgEdgeV2" tooling/cli/src/commands/kg.ts` | `specs/pending/ast-codebase-kg-visualizer/outputs/evidence/p1/kg-types-audit.log` |
| P1-C03 | `rg -n "exports|imports|calls|return_type|type_reference" specs/pending/ast-codebase-kg-visualizer/outputs/kg-bundle/sample-graph-v2.json` | `specs/pending/ast-codebase-kg-visualizer/outputs/evidence/p1/visualizer-schema-sample-audit.log` |

## Completion Checklist

- [ ] Final CLI signature is explicit.
- [ ] Default output path is explicit.
- [ ] Deterministic export rules are explicit.
- [ ] Unit test matrix is explicit.
- [ ] `outputs/manifest.json` updated (`phases.p1.status`, `updated`).
