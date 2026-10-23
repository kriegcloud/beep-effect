# Storage retention re-census — 2026-10-23

Refs #1871. Dry run only; nothing was applied.

The command is the same one the [2026-10-22 plan](./2026-10-22-storage-retention-plan.md) ran, from lane `chore/rsc-workstation-ops` at `6f25dd7c4d`:

```sh
bun run beep quality residue-reap --fleet --classes checkout-qa \
  --classes checkout-qualification --classes checkout-generated \
  --classes checkout-jobs --classes checkout-ledgers --classes checkout-pids \
  --classes checkout-material --json
bun run beep session open
```

| Measure | 2026-10-22 | 2026-10-23 (`2026-10-23T20:58:56Z`) |
| --- | ---: | ---: |
| Checkout roots scanned | 220 | 194 |
| Roots with candidate rows | 130 | 113 |
| Rows | 5,099 | 4,639 |
| Rows eligible to apply | 0 | 0 |
| Skip reason | 5,098 `foreign-owner`, 1 `owner-ruling-required` | 4,639 `foreign-owner` |

## Whose owners S44 retired

528 of the 2026-10-22 rows (440,270,924 apparent bytes) are absent today. Every one belonged to one of 33 owner checkouts that no longer exist, each retired during S44:
- 23 of the 30 Vitest lanes retired for [#1877](../../../repository-simplification-residue/history/receipts/2026-10-23-vitest-lane-retirement-result.md) (the other 7 had no candidate rows on 2026-10-22);
- seven `beep-effect11-worktrees/s44-*` lanes;
- `s43-tooling-debt`, `s44-coverage-1894` and `ts7-tooling`.

That subset therefore has nothing left to apply. Their tracked and untracked residue went into each lane's archive at retirement, but their git-ignored `.beep/` rows did not; the [#1877 receipt](../../../repository-simplification-residue/history/receipts/2026-10-23-vitest-lane-retirement-result.md#ignored-state-loss) records that loss and #2167 tracks the archive gap.

Every row still present is skipped as `foreign-owner`: it lives in a checkout that still exists and is not this lane. This lane has no candidate rows of its own, so no eligible apply subset exists. There is therefore no dry/apply pair, recovery journal or interruption witness. Physical bytes reclaimed by this receipt: 0. The S44 orchestrator has paused further foreign-lane applies until #2167 lands.

## Left open (#1871)

- Owner rulings, or owner-checkout dry/apply runs, for the 4,639 remaining foreign rows, including the research/corpus/runtime protected rows.
- A real recoverable dry/apply pair with its recovery journal and interruption witness, once an eligible subset exists and #2167 has landed.
