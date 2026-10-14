# Schema shape default: branded S.Opaque for data

## Status

Lifecycle: `active`

Source: [`ops/manifest.json`](./ops/manifest.json)

## Mission

Make branded S.Opaque the default shape for plain data schemas, brand every schema class, and arm schemaClassMissingBrand

## Launch

Use this command for execution-capable sessions:

```text
/goal follow the instructions in goals/schema-opaque-default/GOAL.md
```

`GOAL.md` is the compact launcher. `SPEC.md` remains the normative contract.

## Read This First

1. [`GOAL.md`](./GOAL.md) - compact `/goal` launcher.
2. [`SPEC.md`](./SPEC.md) - normative source of truth.
3. [`PLAN.md`](./PLAN.md) - active execution plan.
4. [`ops/manifest.json`](./ops/manifest.json) - machine-readable routing.
5. [`research/`](./research/) - supporting research, if present.
6. [`history/`](./history/) - evidence and closeouts, if present.

## Current Phase

P2 Verify — codemod applied and proven at `@effect/tsgo` 0.51.1; cheap gates being burned down; the PR merges last in the orchestrator queue (D7).

## Latest Evidence

- [`research/codemod-run.md`](./research/codemod-run.md): 5,385 `S.Class` + 370 `S.TaggedClass` converted to branded `S.Opaque`, 457 classes branded in place, 1,052 errors branded; `run.ts --check` 0; repo-wide `bun run check` 265/265; 146-package test sweep green.
- [`research/class-census.md`](./research/class-census.md), [`research/schema-shape-semantics.md`](./research/schema-shape-semantics.md): the evidence behind D1–D8.

## Notes

- Re-run the codemod on `origin/main` to resolve conflicts (`bun run goals/schema-opaque-default/ops/codemod/run.ts`, then `--check`); never hand-merge its output.
- `schemaClassMissingBrand` cannot be configured until the `@effect/tsgo` 0.52 bump (tsc-rs parity, #1636); the proof installs 0.52 temporarily.
