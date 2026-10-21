# Entity Optimistic Concurrency

## Status

Lifecycle: `active`

Source: [`ops/manifest.json`](./ops/manifest.json)

## Mission

Make every entity-repository write compare-and-increment rowVersion so concurrent writers fail typed instead of losing updates

## Launch

Use this command for execution-capable sessions:

```text
/goal follow the instructions in goals/entity-optimistic-concurrency/GOAL.md
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

P3 Yeet — local verification green; PR published through yeet.

## Latest Evidence

Stale-write and race tests per adapter are listed in [`PLAN.md`](./PLAN.md) (write-path inventory).

## Notes

- Fibers cannot force a read-modify-write race on one PGlite session; the
  documents suite injects the competing write at the `PgClient` seam
  (`packages/documents/server/test/CompetingWrite.ts`).
