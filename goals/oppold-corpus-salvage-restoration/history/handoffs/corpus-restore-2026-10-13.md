# Corpus restore handoff — 2026-10-13

## Run-9c scope and provenance

The latest ruling authorizes three PR6 round-two fixes, one push, thread
replies/resolution, and then stop. No wave or merge in this run. Initial
head 782196bf326a44d26d23ce4fcc7a88a18a25a877 on the existing selector branch;
clean, installed, origin/main merge already up to date. Existing selector,
orchestrator receipts and merge commit retained. PR6 #1611 open and ready.
Goal adoption is read-only and conflict-free. Goals doctor baseline: zero
new or inherited blockers, three unrelated advisories, none for this packet.

## Review correction and proof

Explicit selected denominators must equal one; mismatches return a typed
CorpusCommandError before family state. Flag help identifies objectId.
Membership schema enforces globally unique objectIds. New regression uses
a duplicate unselected identity with a differing digest, proves schema
refusal and command refusal before family state. Existing malformed-plan
fixture encodes invalid boundary data without bypassing schema construction.
Nine focused cases pass: five selector cases and four required restoration
cases. Initial new-fixture failure was corrected by enabling the required
larger synthetic PST. Quick package-verify passes lint and check; final
repeat follows the corrected test fixture. No engine behavior changes.

Initial heavy wrapper failed before work because user bus variables were
absent; the approved wrapper succeeds with existing per-user bus variables.
No configuration or unit files changed. Reversal of the three contract
changes is reverting this commit, with both sealed families retained.

## Re-measured prerequisites

| Check | State | Measured value |
| --- | --- | --- |
| P0 sealed | met | 755 directory passes, 10,696 file passes, four inherited losses, one preflight, one seal |
| Slice candidate | met | 53 PST passes, 23 eligible recycle occurrences, 56,140,800 bytes |
| Sealed transformation state | met | Original failure: expected/terminal one, unapproved one; fresh pass: expected/terminal one, unapproved zero |
| Engines | met | pffexport 20260917; bubblewrap 0.13.0; OpenJDK 27, 2026-09-15; Tika 3.3.1 |
| Engine smokes | met | Both approved beep-heavy/bwrap smokes exit zero |
| Capacity | met | 242,532,237,312 free bytes, above 100 GB floor |
| Synthetic exception/accounting/resume cases | met | Four required focused cases pass |
| Main code at live launch | deferred | This run changes PR6 source; run 10 requires merged PR6; no live launch |
| Tika capture and portable paths | retained | Previously merged P1 fixes and freeze records remain unchanged |
| Active transformation units | met | Zero matching corpus-restore heavy units |

Selected objectId:
`da19981ddcd62e532156584b7d8ef06762122f1cffc3f032ac36436d5492fdae`.
Source digest:
`d547453d9d9680d28c898892982e8b3798452fa9e608a40f860ef88cd152907d`.
Tika jar digest matches the freeze record:
`0e8ee9795ac4244feab466f4a5a9c3b94675af392848243842cb6e1e69d27103`.
Original sealed ledger digest:
`efb4b558c2d1680f87a684a69d6aa021653234d12928aa9f27a6943de8970e9f`.
Fresh accepted ledger digest:
`33ad3245d090f519b573769503ebb39162a8806864f664ab0817b705a72fccf5`.
No probe or live launch in this review-only run; no private tool log read.

Final quick package proof passes: lint 4.1 seconds, check 7.5 seconds.
Goals doctor remains zero blockers with the same three unrelated advisories;
goals index matches. Source diff and whitespace review pass. Additional
docgen-local verification is running. Run-9c explicitly prescribes quick
package proof plus focused tests; full test-tsgo, JSDoc ratchet, Fallow and
coverage are not repeated for this narrow correction. Prior run-9B results
remain historical evidence, not proof of this new head. Reference links absent.
Graft estimated 85,365 tokens saved in one retrieval.

## Content-final proof

Scoped docgen-local passes: two successful tasks, 25.397 seconds; CLI docs
aggregate successfully. Final quick package lint/check and all nine focused
tests pass. No new tracked generated files or reference links. Final fetch
and merge are already up to date; PR6 remains open and ready on its previous
head before the single authorized correction push.

Publication uses the run-9c one-push instruction on the existing PR, with
no new PR and no detached monitor or gate started by this worker. The
orchestrator retains hosted readiness and merge ownership. Full parity
producers outside the named quick/test checks are not repeated under the
narrow ruling; docgen-local is current, historical full producer evidence
remains in the earlier handoff. Knowledge refs checks committed HEAD next.

## Run-9c final report

lane: corpus-restore
head: 3c20058677a15ab706b0fd057986b118b99ea3f4 (exact pushed PR6 head)
PR(s): #1611 OPEN, ready, ready-for-heavy; all three run-9c threads answered and resolved; zero unresolved threads, complete pagination
package-verify: @beep/repo-cli: pass (quick; lint 4.1 s, check 7.5 s); nine focused tests pass; both engine smokes pass
hosted-parity: test-tsgo not run (run-9c prescribes quick package check and focused tests) | docgen local pass (two tasks, 25.397 s) | jsdoc-ratchet not run (narrow run-9c proof; commit-hook JSDoc pass) | knowledge refs pass (committed head; zero live gated observations) | fallow audit+health not run (narrow run-9c proof) | scoped coverage not run (narrow run-9c proof; prior full evidence is historical)
handoff: goals/oppold-corpus-salvage-restoration/history/handoffs/corpus-restore-2026-10-13.md
open items: Orchestrator owns hosted CI and the restarted review window; observed checks: four success, twenty-one in progress, three pending. No merge-ready claim or merge. Run 10 remains gated on PR6 merge; zero P2 families launched. P1 remains complete; both sealed ledgers and manifests retained. All three authorized fixes are published in one push; reversal is reverting the review-fix commit while retaining sealed evidence. No worker-owned job or gate remains running. Final fetch/merge already up to date, reference links absent. The committed handoff contains scope, decisions, receipts and proof; this exact-head post-push report is appended locally for the next packet evidence commit, avoiding a second push. Graft saved approximately 85,365 tokens in one call.
final 3c20058677a15ab706b0fd057986b118b99ea3f4 #1611


## Run-10 launch provenance and re-measured prerequisites

Latest go ruling and branch correction authorize the nine-family first wave
on feat/oppold-corpus-salvage-restoration-p2-first-wave, from merged PR6
6eb3d036771e868768846b3c56a5aafac69c3b2b. The prior report append is retained.
No source changes or merge of main at setup; the lane already equals main.

| Check | State | Measured value |
| --- | --- | --- |
| P0 seal | met | Expected sealed run; 755 directory passes, 10,696 file passes, four inherited losses, one preflight, one seal |
| Slice candidate | met | 53 PST passes; 23 eligible recycle occurrences; retained P1 identity unchanged |
| Existing state | met | Both immutable P1 ledger digests unchanged; zero P2 ledgers |
| Membership | met | Nine ordered occurrences, all object/digest/size/PST metadata matches the sealed archive |
| Engines | met | pffexport 20260917; bubblewrap 0.13.0; OpenJDK 27, 2026-09-15; Java real path unchanged; Tika digest unchanged |
| Engine smokes | pending | Both approved real sandbox smokes queued through beep-heavy |
| Capacity | met | 236,375,658,496 free bytes; floor 100,000,000,000 |
| Synthetic exception/accounting/resume cases | pending | Re-run before family launch |
| Main code | met | No difference from origin/main in Corpus or libpff |
| Tika and portable-path fixes | retained | Merged fixes and both immutable freeze records retained |
| Active transformation units | met | Zero matching corpus family units before smoke admission |

Membership digest:
00c2bf191c03874664b6167b614b6dfeb1dddac27fadc0407d673eb35b8bd3b2.
Heavy wrapper reports five occupied machine slots; two worker-owned engine
smokes wait without bypassing admission. User-manager variables were absent
and are supplied from the existing runtime socket; no configuration changed.

Nine pre-launch manifests created before any family unit: history/evidence/p2-first-wave-2026-10-13-family-01-run-manifest.json through family-09-run-manifest.json. Policy digests are precomputed from the exact twelve input fields, including selected objectId and membership digest.
Launch-script SHA-256: 5b1d87cb5c420a53e56340bbc092c21826666c9e25ef210a421b8e20955e65e6.
Goal adoption: read-only, zero conflicts; doctor baseline: zero blockers, three unrelated advisories. Both sandbox smokes exit zero. Focused proof is queued through the approved heavy wrapper.

Focused restoration proof: four pass, 78 skipped, 14.93 seconds.
Family 1 launched 2026-10-13T19:07:53.388194+00:00:
unit beep-heavy-corpus-restore-p2-2026-10-13-1.service; ledger relative
to corpus home: staging/restoration/runs/t7-salvage-2026-08-10-p2-2026-10-13-wave-01/ledgers/mail/slice.jsonl.
No later family launched. No source change inside this wave.

Packet checks at launch: launcher within 4,000 characters, manifest parses,
goals index passes after refreshing its git-ignored projection, knowledge
refs at merged code head passes with zero live gated observations. No package
source changed; hosted-parity package producers are not run for this docs-only
wave. Graft estimated 36,982 tokens saved in one retrieval.

Family 1 archive verification completed; persisted family start
2026-10-13T19:15:50.706Z. Slot wait approximately 0.8 seconds; re-verification
477,888 ms from the started stamp. Runtime policy matches the pre-launch
manifest: fa0ce962b1da841d3000f7fa96419d285fe84c509e4553db86845db418803a4c.
At the first transformation check: 88 attachment dispositions (17 repaired,
71 unsupported), zero warning/exception/interruption rows, no terminal seal.
These are progress counts, not accepted repair or child evidence.

First evidence commit refused by commitlint: literal newline escapes
created an overlong body. No commit or push occurred; corrected with a
message file containing actual newlines. Pre-commit secret/typo/Biome checks
passed. Final packet doctor retains zero blockers and the three unrelated
advisories.


## Run-10 mid-wave final report

lane: corpus-restore
head: 89d1f6b07fbbff31435d9d9431628b65c24d83ca (local committed launch-evidence head)
PR(s): #1611 MERGED at 6eb3d03677 | PR7 none (wave still running; no push or merge)
package-verify: not run (docs-only; no package edited). Both real sandbox smokes pass; four required restoration tests pass, 78 skipped, 14.93 s.
hosted-parity: test-tsgo not run (docs-only: no package source changed) | docgen local not run (docs-only) | jsdoc-ratchet not run (docs-only) | knowledge refs pass at exact committed head, zero live gated observations | fallow audit+health not run (docs-only) | scoped coverage not run (docs-only)
handoff: goals/oppold-corpus-salvage-restoration/history/handoffs/corpus-restore-2026-10-13.md
open items: Run-10 authorized mid-wave handoff: family 1 remains active, zero of nine sealed, no result stamp, zero warning/exception rows at last check. Unit beep-heavy-corpus-restore-p2-2026-10-13-1.service; ledger relative to corpus home: staging/restoration/runs/t7-salvage-2026-08-10-p2-2026-10-13-wave-01/ledgers/mail/slice.jsonl. Runtime policy matches its pre-launch freeze record. Archive re-verification took 477,888 ms. Nine immutable pre-launch manifests, the frozen script digest, bounds, aggregate progress and continuation instructions are committed. The other eight families are not launched. Re-arm the watcher; reconcile accepted seal and all children/repair pairs/ceilings, wait 60 s, then use the same script with the next ordinal. Stop and diagnose the first failure; never retry a sealed family or change engine/launcher code inside the wave. P2 remains incomplete; larger/stub/non-PST mail and recycle/DOC obligations remain open. Reversal is reverting packet decisions while retaining all families, outputs and freeze records. Packet doctor has zero blockers and the same three unrelated advisories; launcher/manifest/index and pre-commit checks pass. No worker-owned proof or gate remains running; the family unit is handed over under the latest ruling. This exact-head post-commit report is appended locally for the terminal wave evidence commit. Graft saved approximately 36,982 tokens in one retrieval.
blocked: wave running — 0 of 9 sealed, unit beep-heavy-corpus-restore-p2-2026-10-13-1.service


## Run-11 family 1 accepted and reconciled

Resume follows the Run-11 ruling on the unchanged first-wave branch. The
carried-over Run-10 final report is preserved. Family 1 unit ended; result
stamp is zero. Last row is family-acceptance-pass, expected/terminal one,
unapproved zero. No exception, warning, interruption or failure rows.
All source, policy, membership and launch-script identities match the
immutable pre-launch manifest. No package or engine source changed.

| Check | State | Measured value |
| --- | --- | --- |
| P0 seal | met | Same sealed run; 755 directory passes, 10,696 file passes, four inherited losses, one preflight, one seal |
| Wave membership/source identities | met | All nine immutable manifest identities match the sealed archive; eighteen larger occurrences remain excluded |
| Transformation state | met | Family 1 accepted; no other family launched; unit inactive |
| Frozen engines | met | pffexport 20260917; bubblewrap 0.13.0; OpenJDK 27, 2026-09-15; real Java path unchanged; Tika digest unchanged |
| Real engine smokes | met | Both approved beep-heavy/bwrap smokes exit zero |
| Capacity after family 1 | met | 234,247,569,408 free bytes, above 100,000,000,000 floor |
| Main engine code | met | Corpus/libpff source diff from origin/main empty; frozen code head unchanged |
| Probe-proven fixes | retained | Merged Tika and portable-path fixes unchanged; no new probe or code fix |
| Packet health | met | Zero new/inherited blockers; same three unrelated advisories |

Family 1 unit: beep-heavy-corpus-restore-p2-2026-10-13-1.service.
Ledger relative to corpus home:
`staging/restoration/runs/t7-salvage-2026-08-10-p2-2026-10-13-wave-01/ledgers/mail/slice.jsonl`.
Seal recorded 2026-10-13T19:29:58.274Z.
Attempt: mail:223d8b5d95c014978c5ac714:r0.
Object identity: 2a117127f49f4e806b2a2461afe973a637ab956bbb4d88060fb438623dcdf71e.
Source digest: 1d97dfd772f8cd629d8efcc047b71fb0f3eb8a4753e6e0b204cc0bb775b90d1a.
Ledger digest: 6c9c70a6047bc894f2688a851ef8bbc5cd2cba99a1cdc984dff43bafec66ff67.

Record counts: 315 attachment-type-repair, 3,785 mail-child-pass, one each
family-run-start, family-attempt-start, mail-store-pass, family-run-summary,
and family-acceptance-pass. All 3,623 engine children and 162 derived
children reconcile. There are 82 repaired occurrences / 81 distinct digests,
81 repair-copy and 81 Tika children, 233 unsupported, zero unchanged, zero
other derived children. Unsupported dispositions are not counted as repairs.
Input 61,727,744 bytes; output and family disk usage 147,490,617 bytes;
disk amplification 2.389373197x. Attempt 769,470 ms, 13,071.072 ms per MiB;
family 847,540 ms. Prior queue wait approximately 0.8 s and archive verification
477,888 ms remain recorded. Attempt and family output/time ceilings hold.
Private log read only as counts: two lines, 807 bytes. No content emitted.

Decision: accept family 1 aggregate reconciliation and proceed to family 2
only after the required sixty-second interval and refreshed preflight.
Retain every sealed family and freeze record. Reversal: revert the packet
continuation decision; never reopen or remove a sealed family. P2 remains
in-progress and incomplete. PR7 follows the terminal wave outcome; never merge.


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

Focused restoration proof on this resume: four pass, 78 skipped, 4.81 seconds.
Graft estimated 90,899 tokens saved across two retrievals.


Additional integrity checks: the distinct digest sets in repair-copy and
Tika child paths both equal all 81 repaired digests, beyond equal counts.
Both previous immutable P1 ledger SHA-256 values remain unchanged.
The preserved inventory still has 53 PST occurrences / 23 eligible recycle
occurrences and the same 56,140,800-byte P1 object. Frozen wave membership
and all nine source identities match. No additional probe is needed because
the pre-run fixes are already merged and their immutable evidence is retained.


Packet verification before the continuation-evidence commit: launcher within
4,000 characters, manifest parses, goals doctor zero blockers / same three
unrelated advisories, goals index matches, diff whitespace and public-hygiene
scans pass. Knowledge refs passes at the prior committed head with zero live
gated observations; repeat on this evidence commit before final report.
No package source changed, so full package audit and other package parity
producers are not run for this documentation-only continuation. Engine smokes
and focused restoration tests are current proof, not historical assumptions.


## Run-11 mid-wave final report

lane: corpus-restore
head: f2bd945b8e1b1f397d498c7f952ebe8d01a01e3c (local committed continuation-evidence head)
PR(s): #1611 MERGED at 6eb3d03677 | PR7 none (wave active; no push or merge)
package-verify: not run (docs-only; no package edited). Both real sandbox smokes pass; four required restoration tests pass, 78 skipped, 4.81 seconds.
hosted-parity: test-tsgo not run (docs-only: no package source changed) | docgen local not run (docs-only) | jsdoc-ratchet not run (docs-only) | knowledge refs pass at exact committed head, zero live gated observations | fallow audit+health not run (docs-only) | scoped coverage not run (docs-only)
handoff: goals/oppold-corpus-salvage-restoration/history/handoffs/corpus-restore-2026-10-13.md
open items: Family 1 exited zero and sealed acceptance; all 3,785 children reconcile (3,623 engine, 81 repair-copy, 81 Tika), including identical repair digest sets. Dispositions: 82 repaired occurrences / 81 distinct digests, 233 unsupported, zero unchanged. Zero warnings, exceptions or interruptions. Input 61,727,744 bytes; output/family disk usage 147,490,617 bytes, 2.389373197x amplification; attempt 769,470 ms, family 847,540 ms. Ledger SHA-256: 6c9c70a6047bc894f2688a851ef8bbc5cd2cba99a1cdc984dff43bafec66ff67. All frozen identities and ceilings hold; both previous P1 ledger digests remain unchanged. After renewed preflight and a full sixty-second interval, family 2 launched with the same frozen script, started 2026-10-13T19:35:45.651Z. Unit beep-heavy-corpus-restore-p2-2026-10-13-2.service; ledger relative to corpus home: staging/restoration/runs/t7-salvage-2026-08-10-p2-2026-10-13-wave-02/ledgers/mail/slice.jsonl. Last check: unit active in archive verification, no result stamp or ledger yet; runtime policy comparison remains pending its family-run-start. One of nine sealed, seven unstarted. Free bytes before family 2: 232,788,058,112, above the retained 100 GB floor. Re-arm the orchestrator watcher under Run 11; reconcile family 2's seal, children, repair pairs, identities and ceilings before sixty seconds and ordinal 3. Stop and diagnose the first failure; never retry a sealed family or change engines/launcher inside the wave. P2 stays incomplete; eighteen larger occurrences and remaining estate/recycle/DOC obligations remain open. Decision: continue after accepted reconciliation; reversal is reverting packet decisions while retaining every immutable family, output and manifest. Packet launcher/manifest/index, public-hygiene scan and commit hooks pass; doctor retains zero blockers and the same three unrelated advisories. No worker-owned proof or gate remains running; family 2 is handed over under the explicit mid-wave ruling. The aggregate record, packet updates and carried-over handoff are committed; this exact-head report is appended locally for the next evidence commit. Graft saved approximately 90,899 tokens across two retrievals.
blocked: wave running — 1 of 9 sealed, unit beep-heavy-corpus-restore-p2-2026-10-13-2.service


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


Renewed engine smokes and focused proof are queued through beep-heavy:
both report all five shared slots occupied. No admission bypass or cap
change. Full sixty-second continuation interval completed while queued.
P0 current sealed-run counts: 755 directory passes, 10,696 file passes,
four inherited losses, one preflight and one seal. All nine member source
identities and precomputed policy digests revalidate; next family run root
and stamps absent. Preserve the existing source head during the wave.
