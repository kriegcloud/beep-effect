# Official Data Sync Foundation

## Status

Lifecycle: `active`

Source: [`ops/manifest.json`](./ops/manifest.json)

## Mission

Create an automated official-data backend for `@beep/data` and derive robust
`@beep/schema` literals/codecs from that generated data. The first slice covers
ISO 4217 currency codes, IANA media types, IANA tzdb timezones, and CLDR
territory/continent data.

## Launch

Use this command for execution-capable sessions:

```text
/goal follow the instructions in goals/official-data-sync-foundation/GOAL.md
```

`GOAL.md` is the compact launcher. `SPEC.md` remains the normative contract.

## Read This First

1. [`GOAL.md`](./GOAL.md) - compact `/goal` launcher.
2. [`SPEC.md`](./SPEC.md) - normative source of truth.
3. [`PLAN.md`](./PLAN.md) - active execution plan.
4. [`ops/manifest.json`](./ops/manifest.json) - machine-readable routing.
5. [`research/`](./research/) - source and decision notes.
6. [`history/`](./history/) - future evidence and closeouts.

## Current Phase

P3 Close - package is implemented and scoped verification is complete; closeout
reflection remains pending if this packet is marked complete.

## Latest Evidence

[`history/outputs/2026-06-18-implementation-evidence.md`](./history/outputs/2026-06-18-implementation-evidence.md)
records the sync drift check, package checks/tests, workflow-style test lane, and
the unrelated current-worktree check blocker.

## Notes

- Preserve unrelated worktree changes, especially the independent Sha256/Crypto
  update underway in `@beep/schema`.
- Keep raw official data and metadata in `@beep/data`; schema modules consume it
  via typed `Struct` helpers from `@beep/utils/Struct`.
- Treat checked-in generated modules and JSON sidecars as the source-of-truth
  snapshot; automation detects drift and opens a report-backed PR.
