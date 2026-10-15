# Palantiri Parcels

## Status

Lifecycle: `active`

Source: [`ops/manifest.json`](./ops/manifest.json)

## Mission

Agent-facing Palantiri: schema-typed, freshness-checked parcels served through beep palantiri and palantiri-mcp, starting with account headroom.

## Launch

Use this command for execution-capable sessions:

```text
/goal follow the instructions in goals/palantiri-parcels/GOAL.md
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

P1 Slice — complete (2026-10-15): `beep palantiri parcel account-headroom [--json]` with two-level freshness; see `PLAN.md` Execution Notes. Next: P2 parcels 2–5.

## Latest Evidence

2026-10-15: P1 complete; gates and the live run (envelope `Fresh`, 10 of 13 accounts fresh) are recorded in `PLAN.md` Execution Notes.

## Notes

<Record high-signal constraints or resume notes that do not belong in the
normative spec.>
