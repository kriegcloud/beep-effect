# Corpus restoration recovery engine handoff — 2026-10-14

## Scope and state

Read the complete lane brief, including the 11:14Z recovery engine binding.
Preserved the prior uncommitted final-report append to the 2026-10-13 handoff.
Integrated main and created the recovery-engine feature branch; #1718
was then merged by the orchestrator and is not re-pushed. Integrate that
merge before publication so this PR contains only the recovery changes. No corpus run or
worker-owned runtime family is active. No sealed artifact was modified.

## Renewed prerequisite measurements

| Check | Status | Measurement |
| --- | --- | --- |
| Lane and packet | met | expected corpus-restore lane; complete packet; recovery-engine branch |
| P0 phase and archive | met | P0 complete; 755 directory passes, 10,696 file passes, four inherited-loss rows, one preflight/seal; 53 PST passes, 23 recycle non-stub occurrences |
| Wave state | met | all nine sealed; five accepted, four failed; ordinal 9 unit inactive |
| Ordinal 9 ledger | met | 634 repair rows; one start/attempt/exception/summary/failure; zero accepted store/child/warning rows |
| Ordinal 9 immutable digest | met | 87943da8d7c8b10283008000c1d99ca4a17e411a7824bec520f1f10adae5bc90 |
| Java | met | OpenJDK 27, 2026-09-15; real path /usr/lib/jvm/java-27-openjdk/bin/java |
| Tika digest | met | 0e8ee9795ac4244feab466f4a5a9c3b94675af392848243842cb6e1e69d27103 |
| pffexport and bubblewrap | met | pffexport 20260917; bubblewrap 0.13.0 |
| Capacity | met | 385,180,622,848 bytes; above 100 GB floor |
| Focused restoration proof | met | 8 selected tests pass, including the four required cases and two new recovery cases |
| Main code for recovery | pending | code is local; no launch before merged source equality |
| Actual recovery launch preflight | pending | engine PR must merge; new freeze records and admitted smokes required before launch |
| Doctor baseline | met | 223 packets, zero blockers, six unrelated inherited advisories, no finding for this packet |
| Dependencies | met | bun.lock moved on main integration; frozen-lockfile install succeeded |
| Heavy admission | met | package and hosted-parity commands admitted after queueing; no admission bypass |

## Decisions and release notes

The same Java/Tika chain is bound by the orchestrator. Use the existing
max-elapsed-millis option for the separately frozen recovery budget:
3 × 7,222,485 + 600,000 = 22,267,455, rounded up to 22,320,000 ms.
Family 43,200,000 ms, ratio 4, 2,147,483,648-byte output and 100 GB floor
remain fixed. No default, engine or original launcher change. The runner
already applies that option to extraction and final attempt validation.

Terminal catch now retains schema-defined original classes and stable fields
in optional failureCause evidence, excluding messages, paths and tool output.
Old rows still decode and real engine failures remain unapproved. Regression
proof covers nonzero/empty Tika output on a synthetic GIF, the larger elapsed
budget, the unchanged family deadline and full-output/budget behavior.
The first test run exposed a diagnostic guard matching the outer wrapper
before the inner cause; corrected the order and the rerun passed all eight.

| Release notes without changesets | Change | Release impact | Reversal |
| --- | --- | --- | --- |
| @beep/repo-cli (private) | Add optional message-free terminal diagnostics; document independently frozen recovery bound | Additive field; no major release; no changeset under #1566 | Revert code and packet decisions; retain all immutable corpus evidence |

The approved recovery batch has four sequential fresh tool families, one
failed occurrence per family as the existing selector requires. A repeated
second-pass failure receives unsupported recovery disposition with retained
evidence, never a third attempt. The disposition never approves a sealed
engine failure or promotes partial repairs. New manifests must name the
actual merged engine codeHead and measured versions before launch; none is
created in this engine-PR preparation run.

Open items: engine PR merge, new manifests and recovery execution; eighteen
larger occurrences and estate/recycle/DOC gates remain open for P3.
P2 remains in-progress, P0/P1/P4 complete and P3 pending. Reversal: revert
code and packet decisions while retaining every ledger, output, claim and
manifest. The user-manager environment failure and cause-loss friction are
recorded in research/OPPORTUNITIES.md at discovery.


## Verification progress

Eight selected corpus-command tests pass; three transformation coverage
cases pass, including bounded nested-cause projection. Initial test-tsgo
found two introduced test diagnostics (TS377050 pipe style and TS2345
record shape). Both corrected before publication; rerun remains required.
Docgen local passed. Full package verification and the remaining parity
lanes are running under admitted beep-heavy jobs, at most two owned jobs.
The original wave launcher digest remains
5b1d87cb5c420a53e56340bbc092c21826666c9e25ef210a421b8e20955e65e6.
Doctor retains zero blockers/six unrelated advisories; packet JSON, GOAL
size, index projection and whitespace checks pass. No runtime launch.


Hosted-parity knowledge refs failed on eleven inherited host-path
observations in the Palantiri exploration and six telemetry packets.
All eight affected files match origin/main exactly; zero introduced path
deltas. No other packet was edited. Attribution and ownership are recorded
in OPPORTUNITIES.md; the standing inherited-fence/S11 route applies if
publication encounters the same rows. JSDoc ratchet passed. Full package
verification, fallow and scoped coverage are still running.


All four approved recovery occurrence identities match the sealed archive
metadata and their original freeze records. Input bytes by ordinal:
5 = 157,975,552; 7 = 354,026,496; 8 = 436,306,944;
9 = 456,877,056. This is metadata identity proof, not a new payload rehash;
the built-in archive re-verify is still required before each live family.
Fallow audit+health passed. Scoped package coverage is running.


The first default package-verify completed audit in 1,153.6 seconds and
passed docgen in 32.2 seconds. Audit ran 6,184 tests: 6,182 passed, two
failed. The new legacy-row test used the v3 Struct.omit signature; verified
Effect v4 source and corrected to an array of keys. The checkout-integrity
knowledge-doctor test compared committed packet bytes against the dirty
manifest update; commit the completed change before rerunning. Neither is
an inherited engine defect or grounds to bypass proof. Package verification
is not yet green. Its inbox row will cite the corrective commit; scoped
coverage's first run likewise began on the dirty packet and must be
attributed before any readiness claim.


## Committed-head package result and publication preparation

Default package-verify passed against corrective commit
ba5997158c566074061a337aa920df240ccd88d0: audit 1,257.9 seconds and
docgen 45.4 seconds. The audit inbox row cites that corrective commit.
The eight focused restoration/recovery cases pass; the previously failing
checkout-integrity case passes after commit. The transformation cause
allowlist tests also pass, including nested wrappers and message/path
exclusion. No package default or real-engine acceptance law changed.

The first coverage run completed 6,184 tests: 6,183 passed and one failed,
the dirty-packet checkout comparison already fixed by committing. Its
unit is inactive. No accepted coverage result or regression-baseline
comparison is claimed from that red run. A fresh committed-head coverage
request remained in shared admission and was cancelled before starting
to prioritize publication under the push-first workflow; it must be
re-submitted before calling final. Final test-tsgo/doctest/schema/sandbox
smokes are queued. No other lane's process or slot was interrupted.

JSDoc ratchet and fallow audit+health passed. Knowledge refs has eleven
inherited observations in eight files that exactly match main; ownership
stays with the orchestrator. The prior terminal evidence PR #1718 is
merged and integrated. No recovery family or new manifest is created.
Publication will carry only this lane's recovery changes and receipts.


## Final preflight results and fixture type-inference correction

Both real sandbox smokes passed through admitted beep-heavy: Apache Tika
3.3.1 and pffexport 20260917. Schema-first lint passed. Doctest verification
passed for the restoration schema file; the new pure example is marked.
Its 23 older unmarked-example advisories are inherited and are not rewritten
in this two-change engine scope.

Final test-tsgo identified TS2322 on curried Struct.omit key inference.
Switching to the verified data-first overload preserves the runtime omission
and fixes inference without changing production code or any policy.
All eight focused corpus tests pass again. The green default package audit
and docgen are retained for identical production inputs; final test-tsgo
and fresh coverage remain required. The queued publication request was
cancelled before it started, before any push, so this correction joins the
same fully addressed publication wave. No family or manifest was launched.


## Final test type-check result

Test-tsgo passed after the fixture uses the data-first omission overload and
typed decodeEffect for its known encoded input. These are test-only API/type
corrections; restoration production source is unchanged from the green
default audit/docgen inputs. Quick package check passed source checking;
its sole lint error was formatting on the edited fixture, now corrected.
The lint inbox row cites this corrective commit. Three warnings and one
info row in agent-effectiveness/graft fixtures are inherited; all three
files match origin/main. No unrelated file is edited.

Fresh coverage is active against the committed packet state. No accepted
coverage or final publication claim is made yet. The pending coverage
result and inherited knowledge observations remain explicit in the report.
All real sandbox, schema, doctest, JSDoc and fallow checks already passed.


## Final coverage and hosted attribution

Fresh scoped coverage passed 6,197 tests across 307 files in 2,417.88 seconds.
Package percentages L/S/B/F: 87.05/86.72/79.24/83.85, above baseline
85.11/84.91/76.56/81.10. Restoration schemas remain 100% in every metric;
transformations L/S/B/F remain 99.93/99.94/99.87/100, with one uncovered
line/statement/branch and zero uncovered functions, exactly the file baseline.
Global uncovered counts grew outside these changes (+975 lines, +1,226
statements, +864 branches, +507 functions); no zero-growth claim is made
for the entire expanded CLI.

Hosted failed-job logs were read immediately through the job API.
Lint Policy: fourteen inherited host-path rows and nine JSDoc warnings in
TsNativeApi and DiffLines. Coverage Regression: sixteen inherited rows
across AccountsUsage, RetiredEffectPaths and seven Skills surfaces. All
reported files match the merge base. No red names a Corpus source file.
The orchestrator owns consolidated inherited repair; no other packet,
source area or CI policy is altered. The ready exact head has zero threads.
Final-file watcher armed the gate; this worker never merges. Its monitor
was cancelled for orchestrator handoff, termination confirmed and receipt
acknowledged. Initial cancellation lacked the user bus environment; the
canonical runtime/bus environment succeeded on retry. No corpus side effect.

## Final report

lane: corpus-restore
head: 28b828ada199415fadbfbfd3af65ee0ef28fa3a2 (exact published PR head)
PR(s): #1731 OPEN, ready for review; #1718 MERGED
package-verify: @beep/repo-cli: pass (default audit 1,257.9 s and docgen 45.4 s; final quick lint/check pass after test-only corrections; restoration production inputs unchanged)
hosted-parity: test-tsgo pass | docgen local pass | jsdoc-ratchet pass | knowledge refs fail, inherited (11 local observations; 14 hosted observations in untouched files) | fallow audit+health pass | scoped coverage pass: 6,197 tests in 307 files, L/S/B/F 87.05/86.72/79.24/83.85; both changed production files match their per-file baseline, with no added uncovered units
handoff: goals/oppold-corpus-salvage-restoration/history/handoffs/corpus-restore-2026-10-14.md
open items: Orchestrator gates #1731 at S11; final file armed at 2026-10-14T13:03:02Z from line "1731 28b828ada1 2026-10-14T13:02:54Z Recovery engine fix". Complete thread read: zero threads, no missing page. Hosted Heavy/Lint Policy is inherited: 14 host-path observations and nine JSDoc warnings. Hosted Heavy/Coverage Regression is inherited: 16 rows in nine non-Corpus files; each affected file matches the merge base. Vercel build-rate-limit rows are environment-only and acknowledged. Hosted readiness/review-window completion and merge are not claimed. The worker monitor is inactive and its final receipt acknowledged; no worker-owned unit remains running. After actual merge, integrate main and create complete new freeze records before the four sequential fresh recovery families for ordinals 5/7/8/9. Same Java/Tika chain; attempt 22,320,000 ms (3 × 7,222,485 + 600,000, rounded up to a minute), family 43,200,000 ms, ratio 4, output 2,147,483,648 bytes and 100 GB floor. Retain original failure classes/stable fields without messages. One recovery attempt per failed occurrence; repeated second-pass failure is unsupported with retained evidence, never a third attempt. No recovery, new manifest or corpus mutation occurred. P2 remains in-progress; eighteen larger occurrences and estate/recycle/DOC gates stay open for P3. Reversal: revert code/packet decisions while retaining every ledger, output, claim and manifest. Final coverage/hosted-red receipts and this report are appended locally for the next evidence commit; all implementation and earlier handoff work are committed and published in one push. Graft saved approximately 88,803 tokens in one retrieval.
final 28b828ada199415fadbfbfd3af65ee0ef28fa3a2 #1731


## Recovery launch preparation after #1731 merge

PR #1731 is MERGED at 226087bfda2c5162679ea5262ffd1b62fe523434.
Preserved the prior uncommitted final-proof/receipt sections in 4ebcbe3d1f;
main integration 08afe6715d retained them through one add/add handoff
conflict. Fresh branch: feat/oppold-corpus-salvage-restoration-p2-recovery-run.
No old merged head branch is pushed. bun.lock unchanged; installed
node_modules retained. Corpus/libpff execution source matches main.

| Prerequisite | State | Measurement |
| --- | --- | --- |
| P0 sealed on main and disk | met | 755 directory passes, 10,696 file passes, four inherited-loss rows, one preflight and one seal for the sealed run |
| Slice metadata selection | met | 53 PSTs; 23 eligible recycle occurrences; selected identity unchanged, input 56,140,800 bytes |
| Recovery membership/source metadata | met | Failed ordinals 5/7/8/9 match all source digests; input bytes 157,975,552 / 354,026,496 / 436,306,944 / 456,877,056 |
| Existing state | met | All four first-wave families sealed failure; four proposed recovery roots absent; no sealed retry |
| Engine freeze | met | pffexport 20260917; bubblewrap 0.13.0; OpenJDK 27 dated 2026-09-15 at /usr/lib/jvm/java-27-openjdk/bin/java |
| Tika jar | met | 0e8ee9795ac4244feab466f4a5a9c3b94675af392848243842cb6e1e69d27103 |
| Actual sandbox smokes | met | Tika 3.3.1 and pffexport 20260917, admitted under beep-heavy |
| Capacity | met | Initial free bytes 340,800,180,224; floor 100,000,000,000 |
| Focused restoration proof | met | Four selected cases passed, 83 skipped, nine seconds |
| Engine PR and source equality | met | #1731 merged; execution source matches origin/main; code snapshot 08afe6715d2715713618b2d9f2ea64c8aba6b6b7 |
| Doctor baseline | met | 226 packets; zero blockers; six unrelated inherited advisories; none for this packet |
| Heavy admission | met | All five slots initially busy; admitted normally, no bypass or other-lane cancellation |

Recovery launcher SHA-256:
9c39a78e1b143f7b6d0df48bb680eee8e723db3c41b179ffd48c36308ff5c98d.
Four manifests: history/evidence/p2-recovery-2026-10-14-family-05,
-07, -08 and -09-run-manifest.json (the numeric component is replaced
in the full filename). Each has policySha256 null before launch; fill once
from its family-run-start. Membership digest remains
00c2bf191c03874664b6167b614b6dfeb1dddac27fadc0407d673eb35b8bd3b2.
Attempt ceiling 22,320,000 ms, derived as 3 × 7,222,485 + 600,000,
rounded up to a minute. Family 43,200,000 ms, output 2,147,483,648 bytes,
ratio four and 100 GB floor unchanged. One new attempt per occurrence;
repeated second-pass failure is unsupported with retained cause evidence,
never accepted partial output or a third attempt. Eighteen larger
occurrences and estate/recycle/DOC gates remain open for P3.
Reversal: revert packet decisions; retain every corpus artifact and freeze.


Additional admitted recovery proof: both message-free Tika failure and
separately frozen elapsed-ceiling regressions pass, two selected cases,
85 skipped, 2.37 seconds. Pre-launch manifest commit:
4bd0ea98d73a9c3a285ec0bfd85973d64f8a0223. Full sixty-second interval
completed after the four focused cases and freeze commit; renewed capacity
339,888,861,184 bytes at 13:34:41Z. No recovery root or stamp exists yet.
Knowledge-reference verification queued normally and is now admitted.
No package source changes in this run. Package/parity evidence on #1731
remains retained; source equality with its merged production code is proved.


Knowledge refs at the freeze commit reported sixteen live external-mirror
gates: one introduced SPEC private-log reference, fifteen inherited rows
in eleven documents that match main. Replaced the new location with the
corpus-relative logs/corpus-restore inventory; no engine or freeze field
changed. Rerun after committing; inherited rows remain orchestrator-owned.
No failure of a corpus precondition and no recovery family started.


Final knowledge-reference rerun: fifteen inherited external-mirror gates,
zero introduced gates; all eleven affected documents match origin/main.
The new SPEC location gate is cleared. Runtime preflight is complete;
all auxiliary admitted verification jobs ended. No other lane's job was
interrupted. The committed freeze fields are unchanged, Corpus/libpff
source still matches the recorded code snapshot and merged main.

First recovery launch is ordinal 5, followed only after seal reconciliation
by 7, then 8, then 9. Planned unit:
beep-heavy-corpus-restore-p2-recovery-2026-10-14-5.service.
Planned ledger, relative to corpus home:
staging/restoration/runs/t7-salvage-2026-08-10-p2-2026-10-14-recovery-05/ledgers/mail/slice.jsonl.
On driver resume, read the result stamp and this ledger through aggregate
projections; fill policySha256 once, compare all identities/ceilings,
reconcile accepted children or disposition a repeated second-pass failure
unsupported with retained diagnostic evidence. Never retry this recovery
occurrence or any old sealed family. Launch no further occurrence before
that reconciliation. Publish the aggregate record PR after the recovery
batch ends; this launch handoff is not a content-final record PR.


## Recovery ordinal 5 live handoff — 2026-10-14T13:40:14Z

Launch requested at 13:38:58Z; admitted script started at
2026-10-14T13:38:59.023Z, less than two seconds of slot wait.
Unit beep-heavy-corpus-restore-p2-recovery-2026-10-14-5.service is active.
Private log has one line; re-verification summary count zero; result stamp
absent. The built-in archive re-verification is in progress. No
family-run-start or accepted recovery outcome is claimed. Manifest
policySha256 stays null until observed once from family-run-start.

Execution HEAD at launch: 25ba89181f (packet-only commits after the frozen
source snapshot 08afe6715d2715713618b2d9f2ea64c8aba6b6b7). Production
source equality with that snapshot and merged main is confirmed. Manifest
freeze commit 4bd0ea98d73a9c3a285ec0bfd85973d64f8a0223 predates launch.
No engine, membership, original launcher or old sealed-state changes.
Recovery launcher remains frozen at
9c39a78e1b143f7b6d0df48bb680eee8e723db3c41b179ffd48c36308ff5c98d.
Free bytes before launch preflight: 339,888,861,184. New output is written
only by restore-mail. No other recovery ordinal has started.

Result stamp on resume: ~/.cache/beep/corpus-restore/p2-recovery-2026-10-14-5.result.
Ledger, relative to corpus home:
staging/restoration/runs/t7-salvage-2026-08-10-p2-2026-10-14-recovery-05/ledgers/mail/slice.jsonl.
Run manifest: history/evidence/p2-recovery-2026-10-14-family-05-run-manifest.json.
The driver owns waiting for this live unit under the latest ruling. All
worker auxiliary verification calls have ended; only this transferred
family unit runs. Next action: aggregate reconciliation and unsupported
recovery disposition if the second pass repeats its failure, then the
remaining approved occurrences sequentially. Never relaunch ordinal 5.
Eighteen larger occurrences and estate/recycle/DOC gates remain open for
P3. Reversal: revert packet decisions while retaining all corpus artifacts,
claims, ledgers and manifests. No new record PR until the recovery outcome.


## Recovery launch final report

lane: corpus-restore
head: 85446bf7a8ff2b2f2ad0ecc79945eba5ad85d2e1 (exact committed launch/evidence head; local recovery-run branch)
PR(s): #1731 MERGED at 226087bfda2c5162679ea5262ffd1b62fe523434; #1718 MERGED; recovery record PR: none yet (live outcome pending)
package-verify: no package source edited this run; @beep/repo-cli retained pass from merged #1731 (default audit/docgen and final quick lint/check)
hosted-parity: test-tsgo not run (docs-only; #1731 pass retained) | docgen local not run (docs-only; #1731 pass retained) | jsdoc-ratchet not run (docs-only; #1731 pass retained) | knowledge refs fail, inherited: 15 live gates in 11 documents matching origin/main, zero introduced gates after committed correction | fallow audit+health not run (docs-only; #1731 pass retained) | scoped coverage not run (docs-only; #1731 pass retained: 6,197 tests, L/S/B/F 87.05/86.72/79.24/83.85, changed-file floors unchanged)
handoff: goals/oppold-corpus-salvage-restoration/history/handoffs/corpus-restore-2026-10-14.md
open items: Recovery ordinal 5 launched once in beep-heavy-corpus-restore-p2-recovery-2026-10-14-5.service; script started 2026-10-14T13:38:59.023Z, active in built-in archive re-verification, result stamp absent and family ledger not yet created at last observation. The driver waits for the unit and relaunches this lane for aggregate result/seal/child reconciliation; fill the new manifest policySha256 once from family-run-start. Four pre-launch recovery manifests committed at 4bd0ea98d73a9c3a285ec0bfd85973d64f8a0223 cover only failed ordinals 5/7/8/9, each one fresh family and one attempt. Frozen source snapshot 08afe6715d2715713618b2d9f2ea64c8aba6b6b7 integrates merged main and matches its Corpus/libpff source; later commits are packet-only. Launcher digest 9c39a78e1b143f7b6d0df48bb680eee8e723db3c41b179ffd48c36308ff5c98d. Same engines and measured versions; both admitted real sandbox smokes, four restoration tests and two recovery regressions pass. Attempt 22,320,000 ms (3 x 7,222,485 + 600,000, rounded up to a minute), family 43,200,000 ms, ratio 4, output 2,147,483,648 bytes and 100 GB floor; last prelaunch free space 339,888,861,184 bytes and full sixty-second interval completed. Old sealed families remain unchanged. A repeated second-pass failure receives unsupported recovery disposition with retained cause class/stable fields; it remains unapproved, partial output is evidence only, and no third attempt is permitted. Reconcile ordinal 5 before sequential ordinals 7/8/9, then publish the aggregate record through Yeet; never merge. P2 remains in-progress, P3 pending; eighteen larger occurrences and estate/recycle/DOC gates remain open for P3. Reversal: revert packet decisions while retaining all ledgers, outputs, claims and freeze records. Auxiliary verification calls ended; only the transferred live family unit remains. Doctor: 226 packets, zero blockers, six unchanged unrelated advisories; index, JSON, launcher size and whitespace checks pass. Launch records and earlier receipts are committed locally; this final report is appended for the next evidence commit. Graft saved approximately 75,290 tokens across two retrievals.
blocked: recovery family running, unit beep-heavy-corpus-restore-p2-recovery-2026-10-14-5.service


## Recovery ordinal 5 sealed failure — reboot resume

Unit beep-heavy-corpus-restore-p2-recovery-2026-10-14-5.service is inactive.
Result stamp 1; private log four lines. Journal count confirms one
code-exited entry and one 30.1G memory-peak entry; no log lines copied.
The existing tool seal at 14:05:05.106Z is family-acceptance-failure.
No ledger append, output mutation or retry was performed.

Object identity: 492971fd43294de2fc1f47e58ad0ec78fa0438af9004fcb1166ad42ffd09437d.
Input bytes: 157975552. Retained output: 354621761 bytes
(2.245x input, below ratio four); family elapsed 1264398 ms,
below 43,200,000 ms. Queue less than two seconds; archive re-verification
301,680 ms from started stamp to family-run-start. Total launch to seal
1,566,083 ms. No accepted attempt duration or accepted child reconciliation
is claimed. One start, one attempt, one exception, one summary, one failure;
325 repair rows (108 repaired, 217 unsupported), zero store/child/warning
passes. Partial repairs are retained evidence only.

Retained cause: TikaSecondPassFailure; exitCode 1, emptyOutput true,
truncated false. This repeats the second-pass failure, not elapsed-budget
exhaustion or evidence of a memory kill. Recovery disposition: unsupported;
the underlying engine-failure remains unapproved. One bounded recovery
attempt exhausted; no third attempt permitted. Memory peak 30.1G.
Ledger SHA-256: c2652e8afcd04013aac611852fe541f258d00e5575ff411f3257f98e87315899.
Policy SHA-256 filled once from family-run-start:
149ffa8a6938ff97e79f2ec44aafa0a49f6c1f2b746463215d25194f25562c9d.
All other manifest fields remain unchanged. Three recovery ordinals remain
unstarted: 7, 8, 9. The latest successor ruling authorizes sequential
continuation after this reconciliation and main integration.
Reversal: revert packet disposition decisions, retaining all immutable
ledgers, outputs, claims and manifests. P2 remains in-progress; eighteen
larger occurrences and estate/recycle/DOC gates stay open for P3.


## Reboot-resume prerequisites and freeze stop

| Check | Status | Measurement |
| --- | --- | --- |
| Lane and packet | met | recovery-run branch, packet exists; prior report retained |
| P0 on disk | met | seal matches; 755 directory / 10,696 file passes; four losses; one preflight and seal |
| Slice candidate | met | 53 PSTs, 23 eligible; original 56,140,800-byte selected identity unchanged |
| Recovery membership | met | ordinals 7/8/9 source identities match archived metadata |
| Existing transformation state | met | recovery 5 sealed failure; roots and stamps 7/8/9 absent; no live family unit |
| Engines | met | OpenJDK 27 dated 2026-09-15; pffexport 20260917; bubblewrap 0.13.0; Tika digest unchanged |
| Capacity | met | 338,880,876,544 bytes, above 100 GB floor |
| Synthetic lanes and sandbox smokes | not re-run | prior proof retained; frozen source check blocks launch first |
| Main integration | met | fetched and merged main; bun.lock moved; frozen-lockfile install succeeded |
| Main source equality | met | Corpus/libpff match main |
| Frozen source equality | not met | three JSDoc blocks in Corpus.service.ts differ; launcher would exit 71 |
| Doctor baseline | met | 226 packets; zero blockers; six unrelated advisories before merge |
| Probe and fixes | previously complete | no new probe, engine change or code fix permitted in this resume |

The strict frozen launcher checks the complete Corpus source directory,
including comments. Main integration imports a JSDoc-only change to
Corpus.service.ts (33 additions, six deletions); libpff and restoration
implementation files are unchanged. No runtime identity override is claimed.
Do not invoke the launcher into a known exit-71 preflight. No ordinal-7
started stamp, private live log, output or ledger is created.
Decision: stop before launch and send the identity conflict to the
orchestrator as the brief requires. Keep all frozen manifest fields and
the launcher immutable. Reversal: a separately recorded orchestrator freeze
amendment or an explicitly authorized execution route; retain every artifact.
No new engine/parser repair is attempted. Remaining ordinals 7/8/9 await
that resolution; no third ordinal-5 attempt. Eighteen larger occurrences
and estate/recycle/DOC gates remain P3 open items.
