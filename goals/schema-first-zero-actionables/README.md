# Schema-First Zero Actionables

## Status

Lifecycle: `active`

Source: [`ops/manifest.json`](./ops/manifest.json)

## Mission

Drive repo schema-first governance to zero actionable findings and publish the
result as a mergeable PR. Actionable means every non-exception candidate and
active advisory is either remediated, eliminated by detector improvements, or
reclassified with a durable non-actionable rationale.

## Launch

Use this command for execution-capable sessions:

```text
/goal follow the instructions in goals/schema-first-zero-actionables/GOAL.md
```

`GOAL.md` is the compact launcher. `SPEC.md` remains the normative contract.

## Read This First

1. [`GOAL.md`](./GOAL.md) - compact `/goal` launcher.
2. [`SPEC.md`](./SPEC.md) - normative source of truth.
3. [`PLAN.md`](./PLAN.md) - active execution plan.
4. [`research/baseline-2026-06-11.md`](./research/baseline-2026-06-11.md) - current inventory baseline.
5. [`ops/manifest.json`](./ops/manifest.json) - machine-readable routing.
6. [`history/`](./history/) - evidence and closeouts, if present.

## Current Phase

P0 Packet and baseline. Next action: classify the pre-existing dirty files on
branch `schema-first-zero-actionables`, then start the detector-first
false-positive audit.

## Latest Evidence

Baseline captured on 2026-06-11 in
[`research/baseline-2026-06-11.md`](./research/baseline-2026-06-11.md).

## Notes

- This packet intentionally continues from the active
  `goals/schema-first-v4-capabilities` packet but does not supersede it.
- Existing inventory exceptions are touch-only: re-audit them when detector
  changes, touched files, or stale rationales make them relevant.
- Generated files stay out of scope. Handwritten generated-adjacent wrappers
  remain in scope.
