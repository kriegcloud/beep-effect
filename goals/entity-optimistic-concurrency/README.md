# Entity Optimistic Concurrency

## Status

Lifecycle: `completed-retained`

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

Closed 2026-10-23 as `completed-retained` by operator ruling. P0–P4 are complete;
follow-ups F1 and F2 stay open in [`SPEC.md`](./SPEC.md).

## Latest Evidence

- **Final PR:** #1941 merged on 2026-10-21 as `2a42813ca1` (final head
  `3f4a8999b0`), hand-merged by the operator under S43 (merge on review, reds
  included). Both review threads were answered and resolved.
- **Tests:** stale-write and race tests per adapter are listed in
  [`PLAN.md`](./PLAN.md) (write-path inventory).
- **Reds on main after the merge, both fixed:**
  - repo-cli `architecture-operation-plan.test.ts` failed because the new
    migration was missing from `AcceptedProofManifest`. Fixed by #1967
    (`f758944bad`).
  - repo-cli's test cache key did not cover `packages/_internal/db-admin/drizzle/**`,
    so hosted Test Unit replayed a stale green. Fixed by #2040 (`f5f2acd0fb`),
    which widened the inputs further.
- **Ledger branches:** `fix/ledger-1941-cache-input` (`fc19393671`) and
  `fix/ledger-1941-proof-manifest` (`f0592ad084`) duplicated #2040 and #1967.
  They were archived under `refs/archive/branches/` in the beep-effect6 clone,
  then deleted locally and on the remote (SPEC Decision Log, 2026-10-23).
- **Completion gate:** `bun run beep goals completion refresh --slug
  entity-optimistic-concurrency` reports #1941 `unsatisfied` (2026-10-23),
  because it merged over red required checks. The gating `yeet-verdict` names
  monitor job `9de5adc4-8434-4848-a18c-aa2967c34631`; its run directory was
  not kept when the lane retired. The lifecycle flip rests on the operator's
  2026-10-23 closeout ruling, not on verified merge-time evidence.
- **Reflections:** [`2026-10-21-claude.md`](./history/reflections/2026-10-21-claude.md)
  (implementation) and [`2026-10-23-claude.md`](./history/reflections/2026-10-23-claude.md)
  (post-merge).

## Notes

- Fibers cannot force a read-modify-write race on one PGlite session; the
  documents suite injects the competing write at the `PgClient` seam
  (`packages/documents/server/test/CompetingWrite.ts`).
