# P2 first bounded wave — active-family handoff

Run-10 go follows merged PR6 #1611 at 6eb3d03677. The lane starts from
main on the corrected first-wave branch, retaining the previous handoff.
Nine ordered occurrences match the sealed archive's object, source digest
and input-byte metadata. Range: 61,727,744 to 456,877,056 bytes.

Retained ceilings: ratio 4; attempt 7,200,000 ms; family 43,200,000 ms;
output 2,147,483,648 bytes per family; free-space floor 100,000,000,000 bytes.
All nine freeze records exist before the first launch. They pin code,
source, engine, membership, script and expected policy identities.
Membership digest:
00c2bf191c03874664b6167b614b6dfeb1dddac27fadc0407d673eb35b8bd3b2.
Launch-script digest:
5b1d87cb5c420a53e56340bbc092c21826666c9e25ef210a421b8e20955e65e6.

Both real sandbox smokes pass. Four focused restoration tests pass,
78 skipped, 14.93 seconds. Free bytes before launch: 236,375,658,496.
Both sealed P1 families and their ledger digests remain unchanged.
No P2 ledger existed before launch. No source or engine code changed.

Family 1: unit beep-heavy-corpus-restore-p2-2026-10-13-1.service.
Launch: 2026-10-13T19:07:52Z. Started: 2026-10-13T19:07:52.818Z.
Family start after verification: 2026-10-13T19:15:50.706Z.
Queue wait approximately 0.8 seconds; re-verification 477,888 ms.
Persisted policy matches the pre-launch freeze record:
fa0ce962b1da841d3000f7fa96419d285fe84c509e4553db86845db418803a4c.
Attempt: mail:223d8b5d95c014978c5ac714:r0.

| Surface | Location |
| --- | --- |
| Family 1 ledger, relative to corpus home | staging/restoration/runs/t7-salvage-2026-08-10-p2-2026-10-13-wave-01/ledgers/mail/slice.jsonl |
| Launch script | ~/.cache/beep/corpus-restore/p2-first-wave-2026-10-13.sh |
| Result stamp | ~/.cache/beep/corpus-restore/p2-first-wave-2026-10-13-1.result |
| Freeze records | history/evidence/p2-first-wave-2026-10-13-family-01-run-manifest.json through family-09-run-manifest.json |

At first transformation observation: 88 attachment dispositions, including
17 repaired and 71 unsupported. Zero warnings, exceptions or interruptions.
These are progress counts only: no store/child acceptance, ledger digest,
output amplification or terminal family outcome is claimed.

Zero of nine families sealed; only family 1 launched. The orchestrator may
re-arm the watcher under the explicit Run-10 mid-wave handoff ruling.
Read private logs only as counts; read the ledger through path/message-free
jq projections. Compare persisted policy to its manifest. After a successful
seal, reconcile every child, repair-copy/Tika pair and all ceilings, record
ledger digest and capacity, then wait 60 seconds before the next family.
Launch the same frozen script with the next ordinal; never launch a second
family while this unit runs. Stop at the first failure and diagnose; never
retry a sealed family. Before each next launch re-measure engine identity,
capacity and the main-code condition. No launcher or engine changes inside
the wave. PR7 follows the wave's terminal record; never merge.

P2 is in-progress and incomplete. Larger and stub-sized mail occurrences,
non-PST dispositions, recycle and legacy-Word gates remain open.
Reversal: revert packet decisions while retaining every run, ledger, output
and freeze record. The active family is handed over without cancellation.


## Run-11 — family 1 accepted, family 2 launched

Family 1 sealed acceptance at 2026-10-13T19:29:58.274Z and reconciled before
continuation. One store pass, expected/terminal one, unapproved zero; zero
warnings, exceptions or interruptions. All 3,785 child rows reconcile:
3,623 engine children, 81 repair-copy and 81 Tika children. Dispositions:
82 repaired occurrences / 81 distinct digests, 233 unsupported, zero unchanged.
Input 61,727,744 bytes; output and family disk usage 147,490,617 bytes;
amplification 2.389373197x. Attempt 769,470 ms, family 847,540 ms; both
output/time ceilings hold. Private log: two lines / 807 bytes, counts only.
Ledger digest:
6c9c70a6047bc894f2688a851ef8bbc5cd2cba99a1cdc984dff43bafec66ff67.
The runtime policy equals its immutable pre-launch record.

After successful reconciliation, renewed engine/source/script/membership
checks, both real sandbox smokes, four focused passing tests and a full
sixty-second wait, family 2 launched with the same frozen script and ordinal 2.
Unit: beep-heavy-corpus-restore-p2-2026-10-13-2.service.
Started: 2026-10-13T19:35:45.651Z. Free bytes immediately before launch:
232,788,058,112, above the 100,000,000,000 floor.
Ledger relative to corpus home:
`staging/restoration/runs/t7-salvage-2026-08-10-p2-2026-10-13-wave-02/ledgers/mail/slice.jsonl`.
One of nine families sealed; family 2 active, seven not launched. There is
no second concurrent family and no source/engine/launcher change in the wave.
Continue only after accepted seal, complete child/repair-pair reconciliation,
ceiling and frozen-contract checks, then sixty seconds before the next ordinal.
Stop and diagnose the first failure; never retry a sealed family.
P2 remains incomplete; eighteen larger occurrences and the other estate,
recycle and legacy-Word gates remain open. Reversal: revert packet decisions
while retaining all immutable families, outputs and freeze records.


## Run-12 — family 2 accepted and reconciled

Standing Runs 12+ ruling applies. Preserve the prior locally appended report.
Family 2 unit beep-heavy-corpus-restore-p2-2026-10-13-2.service ended;
result stamp is zero. Seal recorded 2026-10-13T20:25:49.846Z. Last row is
family-acceptance-pass, expected/terminal one, unapproved zero. Exactly one
store pass and zero warnings, exceptions, interruptions or failure rows.

Ledger relative to corpus home:
`staging/restoration/runs/t7-salvage-2026-08-10-p2-2026-10-13-wave-02/ledgers/mail/slice.jsonl`.
Attempt: mail:973a3612438a25029652c75f:r0.
Object identity: 886bd60cee359bcca9ee313bdeb4c08a4c7c3de3e676c021d50425741bfbac14.
Source digest: 4501c21643be4ec9bb146983cd3760c73a8ddb41604c68126198f734dba0f95d.
Policy digest: bd8566190e0a528375ec8489c87d59309db09e4eca72125a5f2fd8680134f899.
Ledger digest: c885172e73301fd762903ef17ed5fd08dfd890604871df89f10fc316de46f1b8.

Record counts: 343 attachment-type-repair, 4,310 mail-child-pass, one each
family-run-start, family-attempt-start, mail-store-pass, family-run-summary
and family-acceptance-pass. All 4,064 engine children and 246 derived children
reconcile for the store attempt. Both distinct digest sets in 123 repair-copy
and 123 Tika children equal the 123 distinct repaired digests. Dispositions:
125 repaired occurrences, 218 unsupported, zero unchanged; zero other derived
children. Unsupported dispositions are not repairs.
Input 98,804,736 bytes; output and family disk usage 265,766,621 bytes;
amplification 2.689816620x. Attempt 2,588,015 ms, 27,465.590 ms per MiB;
family 2,611,137 ms. Archive verification 393,030 ms from the started stamp
2026-10-13T19:35:45.651Z to family-run-start 2026-10-13T19:42:18.681Z.
Queue duration was not captured precisely; the prior handoff records only the
started stamp. All attempt/family output and elapsed ceilings hold.
Private log read as counts only: two lines, 807 bytes.

| Check | State | Measured value |
| --- | --- | --- |
| P0 seal | met | Same sealed run; current-run counts remeasured before continuation |
| Membership/source identities | met | Nine frozen records match source metadata and recomputed twelve-field policy digests |
| Family 2 reconciliation | met | Zero result, accepted seal, 4,310 children and matching 123 repair digest pairs |
| Engines | met | pffexport 20260917; bubblewrap 0.13.0; OpenJDK 27, 2026-09-15; Java real path and Tika digest unchanged |
| Frozen launcher/membership | met | SHA-256 values unchanged from pre-launch records |
| Main engine code | met | Corpus/libpff diff from origin/main and frozen code head empty |
| Capacity after family 2 | met | 239,569,948,672 free bytes, above 100,000,000,000 floor |
| Packet health | met | Zero blockers, same three unrelated advisories; adoption has zero conflicts |

Decision: accept family 2 and continue to ordinal 3 only after renewed
preflight and a full sixty-second interval. Retain the frozen launcher,
engines and all nine pre-launch manifests. No package source changed.
Reversal: revert the packet continuation decision while retaining every
sealed family, output and freeze record. P2 remains in-progress and incomplete.
