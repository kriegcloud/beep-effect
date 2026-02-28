# P1: `beep kg export` CLI

## Goal

Define implementation-ready command, adapter, and test strategy for deterministic KG v1 -> visualizer-v2 export.

## Required Inputs

1. `specs/pending/ast-codebase-kg-visualizer/outputs/p0-architecture-and-gates.md`
2. `tooling/cli/src/commands/kg.ts`
3. `tooling/cli/test/kg.test.ts`
4. `specs/pending/ast-codebase-kg-visualizer/outputs/kg-bundle/sample-graph-v2.json`

## Output Path

`specs/pending/ast-codebase-kg-visualizer/outputs/p1-kg-export-cli.md`

## Frozen CLI Contract

- `bun run beep kg export --mode <full|delta> [--changed <csv>] --format visualizer-v2 [--out <path>]`
- defaults:
  - `--mode full`
  - `--format visualizer-v2`
  - `--out tooling/ast-kg/.cache/codebase-graph-v2.json`

## Adapter Behavior Contract

1. Use KG v1-compatible sources as input.
2. Apply immutable node/edge mapping tables from PRE/P0.
3. Preserve deterministic IDs and provenance metadata.
4. Write full visualizer graph envelope with `meta` counters.
5. Emit typed command summary payload for CI automation.

## Unit Test Matrix (Required)

1. command emits valid visualizer-v2 schema.
2. deterministic output for identical input commit.
3. full vs delta mode behavior correctness.
4. fallback mapping sets `meta.originalType` when required.
5. malformed input source yields typed error output.

## Command and Evidence Matrix

| Command ID | Command | Evidence Artifact |
|---|---|---|
| P1-C01 | `bun run --cwd tooling/cli test -- kg.test.ts` | `outputs/evidence/p1/kg-cli-test-baseline.log` |
| P1-C02 | targeted export command unit tests | `outputs/evidence/p1/kg-export-tests.log` |
| P1-C03 | deterministic double-run diff audit | `outputs/evidence/p1/kg-export-determinism.log` |

## Completion Checklist

- [ ] CLI surface is frozen.
- [ ] Adapter flow is frozen.
- [ ] Unit test matrix is frozen.
- [ ] Evidence contract is complete.

## Explicit Handoff

Next phase: [HANDOFF_P2.md](../handoffs/HANDOFF_P2.md)
