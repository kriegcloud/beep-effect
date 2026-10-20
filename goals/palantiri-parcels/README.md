# Palantiri Parcels

## Status

Lifecycle: `completed-retained`

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

Complete (completed-retained, 2026-10-15). Shipped in #1817 (P0+P1 account headroom), #1831 (P2 four parcels) and the P3 + closeout PR (`beep palantiri mcp`, stale-series clearing, session-open hot parcels). Reflection: [`history/reflections/2026-10-15-claude.md`](./history/reflections/2026-10-15-claude.md).

## Latest Evidence

2026-10-15: P3 complete; a stdio MCP client run, a `beep session open` run and every gate are recorded in `PLAN.md` Execution Notes. P2 complete; gates and one live run per parcel (four `Fresh`, app error classes `Unknown{no-source}`, no `@` or home path in any envelope) are recorded in `PLAN.md` Execution Notes. P1's live run is recorded there too.

## Notes

<Record high-signal constraints or resume notes that do not belong in the
normative spec.>
