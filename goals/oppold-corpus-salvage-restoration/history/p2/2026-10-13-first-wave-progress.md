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
