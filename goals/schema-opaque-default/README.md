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

P3 Yeet — codemod applied on main 3749e7ca4a and proven; the D7 proof (0.52.0 installed, `schemaClassMissingBrand` at error) reports 0 hits; publishing under operator ruling S25 (finalize now, S11 gate).

## Latest Evidence

- [`research/codemod-run.md`](./research/codemod-run.md): 5,385 `S.Class` + 370 `S.TaggedClass` converted to branded `S.Opaque`, 457 classes branded in place, 1,052 errors branded; `run.ts --check` 0; repo-wide `bun run check` 265/265; 146-package test sweep green.
- D7 proof ([`research/codemod-run.md`](./research/codemod-run.md) step 8): with `@effect/tsgo` 0.52.0 and `schemaClassMissingBrand` at error over all 279 check/test configs plus `quality test-tsgo`, 0 brand hits. 28 `preferEffectArray` hits are inherited lines added to main after #1636, left to the 0.52 bump lane.
- [`research/class-census.md`](./research/class-census.md), [`research/schema-shape-semantics.md`](./research/schema-shape-semantics.md): the evidence behind D1–D8.

## Notes

- Re-run the codemod on `origin/main` to resolve conflicts (`bun run goals/schema-opaque-default/ops/codemod/run.ts`, then `--check`); never hand-merge its output.
- `schemaClassMissingBrand` cannot be configured until the `@effect/tsgo` 0.52 bump (tsc-rs parity, #1636); the proof installs 0.52 temporarily.
