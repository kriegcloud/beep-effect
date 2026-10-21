# effect/String migration

## Status

Lifecycle: `active`

Source: [`ops/manifest.json`](./ops/manifest.json)

## Mission

Move native String method calls to effect/String so @effect/tsgo 0.55+ can arm preferEffectString at error

## Launch

Use this command for execution-capable sessions:

```text
/goal follow the instructions in goals/effect-string-migration/GOAL.md
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

P1 Implement — wave 1 merged (#1968, 193 sites); wave 2 (145 sites, 24 packages) in review; see the Waves table in `PLAN.md`.

## Latest Evidence

`research/census-2026-10-21.md`: 1,413 sites in 365 files (508 source,
905 tests); 647 labelled same-runtime, 766 shape-changing.

## Notes

Spun out of the `@effect/tsgo` 0.54.1 bump (branch `chore/effect-tsgo-055`),
which pins below 0.55 until this goal arms the rule.
