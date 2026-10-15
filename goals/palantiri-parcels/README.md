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

P3 MCP + session — complete (2026-10-15): `beep palantiri mcp` serves the five parcels and a listing as stdio MCP tools with the same JSON as `beep palantiri parcel <id> --json`, gauges drop stale series in the long-lived host, and `beep session open` prints account headroom, lane reds and host pressure within 2 seconds and stages them for the SessionStart hook; see `PLAN.md` Execution Notes. Next: P4 Yeet.

## Latest Evidence

2026-10-15: P3 complete; a stdio MCP client run, a `beep session open` run and every gate are recorded in `PLAN.md` Execution Notes. P2 complete; gates and one live run per parcel (four `Fresh`, app error classes `Unknown{no-source}`, no `@` or home path in any envelope) are recorded in `PLAN.md` Execution Notes. P1's live run is recorded there too.

## Notes

<Record high-signal constraints or resume notes that do not belong in the
normative spec.>
