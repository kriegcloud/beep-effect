# Storage retention result for issue #1871

The [per-row plan](./2026-10-22-storage-retention-plan.md) records a fresh
`residue-reap/v3` dry run at `2026-10-22T12:38:05.225Z` and the associated session/process
reads. Issue #1871 remains open. This attempt establishes no physical reclamation.

| Measure | Result |
| --- | ---: |
| Checkout roots scanned | 220 |
| Checkout roots with candidate rows | 130 |
| Checkout roots without candidate rows | 90 |
| Rows surveyed | 5099 |
| Rows deferred | 4973 |
| Rows excluded by explicit path boundary | 126 |
| Rows ruled TERMINAL | 0 |
| Rows applied / archived / deleted | 0 / 0 / 0 |
| Surveyed apparent bytes | 8224709825 |
| Surveyed btrfs exclusive bytes | 7995277312 |
| Applied apparent / exclusive bytes | 0 / 0 |
| Physical bytes reclaimed | 0 |

The tool returned `skip` for every row, with 5098 `foreign-owner` results
and one `owner-ruling-required` result. All rows lack verified owner attribution.
The live read has 17 inaccessible same-user cwd links, so an unobserved holder
cannot support a TERMINAL ruling. Explicitly protected paths remain in place.
Counts below overlap because a row may have several reasons.

| Reason preventing apply | Rows |
| --- | ---: |
| `cwd-visibility-incomplete` | 1161 |
| `foreign-owner-tool-fence` | 5098 |
| `live-checkout-cwd` | 3147 |
| `material-owner-required` | 3942 |
| `open-session-ledger` | 1226 |
| `owner-ruling-required` | 1 |
| `owner-unverified` | 5099 |
| `practice-services-excluded` | 1 |
| `primary-clone-excluded` | 125 |

## Apply and recovery

No row passed the brief's terminal and ownership requirements, so there is no
eligible apply set. No `--apply`, `--resume`, or `--restore` operation ran.
No source data moved and no recovery journal intent was created. The persisted
dry-run plan/report live in this lane's
`.beep/residue-reap/97847321-2e86-414d-b926-e8cd26d054ca/`.

The implementation supports inode-bound archive intents, `--resume <run-id>` and
`--restore <run-id>`. Its interruption checkpoint is an injected test hook, not a
CLI flag. This attempt produced no interruption witness because it performed no
archive operation. Historical fixture success is not evidence of a real apply.
Archive moves, if later authorized and eligible, still count as zero physical
reclamation until a separate purge. The zero physical result here follows from
performing no removals; concurrent workstation free-space drift is not credited.

## Left open

- Verified owner attribution and complete liveness evidence for deferred rows.
- Execution from each owning checkout for eligible foreign rows. The current
  lane-only assignment cannot perform those archives or install owner rulings.
- Research/corpus/runtime owner decisions; material rows remain owner-required.
- An eligible dry/apply pair, recovery journal and interruption witness from a
  real recoverable apply. No witness or acceptance claim is substituted here.

No source change, standards inventory, baseline, exception, or workflow change
was needed. The lane wrote only these two public receipts and private evidence.
Reverse the receipts through their PR; source restoration is unnecessary.
