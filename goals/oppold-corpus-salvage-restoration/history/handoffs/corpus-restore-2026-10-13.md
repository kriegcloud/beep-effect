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
