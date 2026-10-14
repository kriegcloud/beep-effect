# Stage 4: structured completion receipts

Lane: `rsc-h2-completion`. Implementation and reconciliation ship together.
The completion receipt is derived after merge; the manifest declares a final PR,
never its own future merge commit. Lifecycle state is unchanged.

## Contract and recovery

The additive schemas distinguish final and supporting PRs and optional acceptance
evidence. Legacy singular/plural PR fields normalize in memory; grandfathered
packets retain their bypass. `GoalCompletionVerifier` resolves a typed observation
without I/O. The GitHub adapter binds the final PR head to its merge result without
requiring original-head ancestry for squash or rebase. Single-parent commits do
not establish squash versus rebase, so method remains unknown rather than guessed.

Historical required checks come from ruleset versions effective at merge, with
the version endpoints retained in the receipt. Check runs use `filter=all`, so a
post-merge rerun does not erase a pre-merge result. Unsupported historical ruleset
conditions and unavailable observations remain unknown. Repository inventory
cannot reconstruct deleted rulesets; that historical completeness boundary remains
an adapter limitation. Proof-fact and packet-history evidence references are
recognized but remain unknown until a head-bound provider is implemented.

The reused `MergeGateCheckRun` lives in a schema-only module with its existing
identifier and public re-export retained, preventing completion observations from
importing merge-handler runtime wiring.

Storage reuses `resolveProofLedgerLocation`: the owning clone's
`.beep/goals/completion-receipts.ndjson`, separate from ProofLedger. ProofFact
version, expiry and TTC semantics are unchanged. Reads reject mismatched repository,
packet, declaration digest or PR; incomplete trailing rows are ignored. A failed
refresh cannot displace definite evidence. Doctor reads only;
`bun run beep goals completion refresh --slug <packet>` is the explicit writer.
Revert the owning PR to restore the former reader; delete derived receipts and
refresh to rebuild them.

## Commands and fixture outcomes

All heavy commands use `beep-heavy` with the user-session bus environment; at most
two H2 admissions run concurrently. Scratch command logs remain lane-local.

| Fixture | Expected outcome |
| --- | --- |
| Merged PR without packet-name title, squash/non-ancestor accepted head | verified |
| Merge and rebase observation shapes | verified |
| Unmerged final PR, required red, stale head-bound evidence | unsatisfied |
| GitHub/rate-limit error or missing historical ruleset | unknown |
| Grandfathered manifest | verified bypass |
| Nongating historical statement failure | overall verified, sub-claim unsatisfied |
| Post-merge red rerun following pre-merge success | required check verified |
| Changed nested initiative.packetId | different declaration digest |
| Partial append or stale digest/PR | ignored |
| Unknown refresh following definite receipt | definite evidence retained |
| Doctor online versus explicit refresh | read-only versus append |
| All live manifests | decode without rewrite |

Final package, parity and coverage results are recorded in the lane handoff.
Required commands: `beep quality package-verify @beep/repo-cli`,
`beep quality test-tsgo`, `beep docgen local --base origin/main`,
`beep ci lane jsdoc-ratchet`, `CI=true beep knowledge refs --check`,
`beep quality fallow audit`, `beep quality fallow health`, and scoped goal-test
coverage compared with the existing touched-file baseline rows.

## Qualification and scope

Qualified implementation and fixture head: `9e05651ae0237b10ffed2da4d3574909715dd74d`.
Later delivery commits contain packet evidence and main integration. The source
review returned ZERO ACTIONABLE FINDINGS at this head; it is separate from the
compiler and runtime results below.

| Command | Result |
| --- | --- |
| `beep quality test-tsgo` | pass after the Arbitrary import and markerless-doctor repairs |
| `beep docgen local --base origin/main` | pass, one package aggregated |
| `beep ci lane jsdoc-ratchet` | pass; zero non-generated legacy findings |
| `CI=true beep knowledge refs --check` | pass; zero live gated observations after D repaired the inherited SPEC literal |
| `beep quality fallow audit` / `health` | pass; zero introduced findings, one inherited-adjacent audit finding |
| Scoped goal and merge-gate coverage | 258 tests passed across 13 files; every existing touched baseline row met or improved |
| `beep quality package-verify @beep/repo-cli` | pass on delivery head `f28278cc12`; full audit 989.2s, docgen 27.3s |

All heavy commands ran through the canonical admission wrapper, with at most two
H2 admissions. The scoped fixture run uses its own module-cache path to avoid
colliding with package audit. No baseline or suppression was added. Percentages
below are the scoped read, not a claim of repository-wide coverage. Existing
baseline uncovered counts also met or improved.

| File | Lines current / baseline | Statements current / baseline | Branches current / baseline | Functions current / baseline |
| --- | --- | --- | --- | --- |
| Bootstrap.schemas.ts | 100% / 100% | 100% / 100% | 100% / 100% | 100% / 100% |
| Completion.ts | 80.15% / no row | 76.71% / no row | 54.54% / no row | 71.02% / no row |
| Doctor.ts | 81.58% / 63.34% | 81.31% / 63.59% | 71.73% / 42.42% | 88.4% / 72.09% |
| Goals.command.ts | 50% / 50% | 50% / 50% | 100% / 100% | 0% / 0% |
| Goals.schemas.ts | 100% / 100% | 100% / 100% | 100% / 100% | 100% / 100% |
| MergeGate.schemas.ts | 100% / no row | 100% / no row | 100% / no row | 100% / no row |
| MergeGate.ts | 100% / no row | 100% / no row | 100% / no row | 100% / no row |

The implementation adds completion schemas/service/readers and explicit refresh,
changes doctor reporting and command registration, and extracts the existing
MergeGate check schema to break the runtime/static cycle while preserving its
identifier and re-export. Reconciliation changes only the three named manifests.
No root/generated wiring or reference links are authored by H2. The initial patch
note was retired once D policy #1566 merged because `@beep/repo-cli` is private.

First hosted head `9737a4a77e` failed Property Laws and both repo-cli unit shards
on the invalid Arbitrary module path; the second shard also exposed unconditional
doctor root discovery in markerless fixtures. Completed job logs were read at once.
Imports were repaired in `c433eba29e`; doctor eligibility and the root-probe
regression assertion were repaired in `9e05651ae0`. Their inbox rows are acknowledged
against the repair commits. The separate review missed the import error; the test
compiler, rather than that assurance, establishes the corrected module boundary.
Hosted proof is read on the latest PR head. Vercel's two deployment statuses report
rate limits and are environment-only under the existing merge-gate exception.

## Doctor before and after

Before, at `9914e98a86`: packets=211, blocking_new=0, blocking_inherited=0,
blocking_resolved=0, advisories=3; all three were completion-gate-unsatisfied.
After, offline without clone receipts: packets=211, blocking_new=0, advisories=3;
the three typed packets are completion-gate-unknown. Legacy packets retain their
offline fallback. Read-only live observations verify all three PR-merge parts.
The final online fleet command reports packets=211, blocking_new=0,
blocking_inherited=0, baseline_resolved=0, advisories=19. All three targeted
packets are absent from that advisory list; 19 legacy packets have unknown
historical evidence. Post-merge refresh
remains pending the orchestrator's merge.

## Known advisories

All three observations bind 16 historical required contexts to the accepted head.
Ruleset `10240248`, version `50918272`, effective `2026-09-25T14:46:59.802Z`,
was selected from repository ruleset history. Overall outcomes below concern
merged-PR acceptance. Statement sub-claims are separately reported and nongating
under R79/R80. Automated non-required red attribution stays unknown; the explicit
log comparisons below supply the independently reviewed attribution.

| Packet / final PR | Accepted head | Merge commit / time | Outcome / sub-claims |
| --- | --- | --- | --- |
| document-ast-pattern-classification / #1429 | e9eafb4a6f296ffb5f24a5b5cf610624199c43c3 | 2f2426b695ff2d082443dceb484a40c0c41c1b77 / 2026-10-06T00:55:25Z | verified; draft-ready verified; review window 45m35s verified; merge-ready verdict unknown |
| practice-box-onboarding / #1462 | b106798b3e6070ab539e338bde3704c27d3cf031 | 98c3947d44359fd230a9adfb082268847e3174fb / 2026-10-06T09:51:53Z | verified; draft-ready verified; review window 7s unsatisfied; merge-ready verdict unknown |
| push-first-publish / #1427 | 4bdc437219e17d9a3ad169781eba38edf91ba639 | 01d8c18f314661a7957ef6420b2180ffb29804d1 / 2026-10-06T01:36:13Z | verified; draft-ready verified; review window 44m33s verified; merge-ready verdict unknown |

### Non-required reds and follow-ups

#1429's merge-base is `cd6c9a1b7223c3e6c7b14265cd0f0c22517f89d4`. After
walking past cancelled runs, its nearest completed main ancestor is
`b877057bc49dca15be45cc7c494e6c9326e5cc92`, run
[37385597353](https://github.com/beep-effect/beep-effect/actions/runs/37385597353).
A later main run is not its valid baseline.

- Lint Policy: pending at merge, final failure at `00:59:04Z`; head job
  `112041342859` versus baseline `112020340130`. Baseline failures are
  `knowledge:refs-check` and `lint:schema-first`. Head adds `lint:tsgo-rules`,
  schema package `lint:laws`, and law-practice/server `lint:laws`. Attribution
  is mixed: inherited root failures and introduced alias/PatternOntology errors;
  the unexplained law-practice delta remains unknown rather than charged to H2.
- Coverage Regression: pending at merge, final failure at `01:13:36Z`; head
  `112041342921` versus baseline `112020340159`. Head has 11 rows: PracticeKg
  four, RestorationTransformations three, Retire three, PatternOntology one.
  The baseline log is incomplete, so full-lane attribution is unknown. The new
  PatternOntology branch row is an introduced follow-up; other rows cannot be
  classified from absent baseline evidence.

#1427's merge-base and nearest completed main ancestor are
`61d1b494f05cb3974538071d5b5d1b32a25443d0`, run
[37395917048](https://github.com/beep-effect/beep-effect/actions/runs/37395917048).

- Lint Policy: pending at merge, final failure at `01:42:00Z`; head
  `112053879379` versus baseline `112052129675`. Head failures
  `knowledge:refs-check` and law-practice/server `lint:laws` are a subset of
  baseline failures (which also include `lint:schema-first`): inherited.
- Coverage Regression: pending at merge, final failure at `01:46:53Z`; head
  `112053879351` versus baseline `112052129591`. Seven baseline rows
  (PracticeKg four, Retire three) persist; 13 introduced rows are Yeet Guards
  three, Planner one, PullRequest four, Yeet.command two, RepoRun.models three.
  Attribution is mixed. Introduced rows are tracked for the program's consolidated
  quality repair; they do not negate the verified required-lane acceptance.

#1462's nearest completed baseline is `bde2e5b8c763b2e5de10b0c9b5a89d145bfc8531`,
run `37436678262`. No failing Lint Policy/Coverage Regression lane was observed
on its head or baseline. Its short review window is preserved as a historical
unsatisfied statement sub-claim, with no lifecycle reset.

Follow-up ownership: the program orchestrator routes introduced historical lint
and coverage rows to their original packet owners in the consolidated repair.
The five remaining substring-only legacy citations (`agent-pipeline-velocity`,
`chat-input-and-theming`, `effect-native-migration`, `mcp-host-retrofit`,
`uspto-mcp`) require owner-confirmed typed declarations in a later migration; H2
changes only the three specified manifests. Missing historical verdicts remain
unknown until an authentic accepted-head verdict is recovered.

## Delivery qualification and recovery

The full repaired-head package command remained unstarted through canonical
admission contention and a retry. The worker stopped only its queued command
and cancelled its owned readiness monitor before handoff. No package result is
inferred from stopping the wrapper. The qualified source is published at PR
#1574; this delivery evidence is committed locally and awaits Yeet publication.
The PR remains draft. The full package gate, content-final ready transition,
readiness monitoring and orchestrator merge remain open.

The final GraphQL lane reported API rate exhaustion. REST updated the PR body
and confirmed its draft/head state. The last successful thread read had zero
threads; a final thread read is unknown until GraphQL quota recovers.

The resume retry acquired canonical admission and returned exit 0: audit 989.2s,
docgen 27.3s. The pass covers `f28278cc12` and qualified H2 source `9e05651ae0`.
The worker then integrated main `df7d88aad7` in `fc0a2f8d28`, retaining both
lanes' append-only friction records without changing H2 source. The resumed
GraphQL-backed Yeet closeout read succeeded with zero actionable threads and
zero unanswered follow-ups. Earlier queue cancellation and quota failure are
historical observations; neither substitutes for this completed proof or read.

## Resumed publication inherited red

The collected cheap gates at integrated `04b80fa137` passed 15 lanes and failed
only Effect-Vitest: one row in `ContradictionDetection.golden.test.ts`, inherited
from main #1572 (file identical to origin/main). Doctor, committed JSDoc ratchet,
schema-first and Fallow audit/health passed. No publication push, ready transition
or new monitor occurred. The orchestrator owns one main repair; H2 merges that
repair and retries its existing delivery wave. The full package pass remains
recorded at its actual delivery head, rather than inferred for later main source.

## Hosted review: deleted historical rulesets

Thread `discussion_r4234859239` correctly identifies an inventory gap: GitHub's
current ruleset list cannot enumerate rulesets deleted since the merge, even
when each surviving ruleset's historical version is readable. The snapshot
now records `inventoryComplete`; omitted legacy fields decode as false.
The live adapter sets false. Passing surviving contexts remain observed facts,
but overall completion is unknown until an independently complete merge-time
inventory is available. A positively observed required red remains unsatisfied.
Stored receipts are re-resolved, so a previously persisted verified outcome
cannot bypass this rule. Lifecycle fields remain unchanged.

The earlier three-packet online observations retain verified PR/head/merge
bindings, passing surviving required contexts and the recorded timeline
sub-claims. After this fix, live overall receipt outcomes are unknown for
#1429, #1462 and #1427 because historical inventory completeness is unknown.
This qualification supersedes earlier overall-verification wording in this
receipt; it does not invent evidence for deleted rulesets.

Regression fixtures cover passing surviving contexts with incomplete inventory,
a complete synthetic snapshot, decoding older snapshots without the new flag,
and revalidation of stored verified receipts with incomplete inventory.
The original squash/merge/rebase, stale-head, required-red, network-failure,
refresh-only writer and lifecycle assertions remain.

Read-only live reread (`bun .beep/h2/run3-online.ts`) confirms all three merged
results and 16 surviving required contexts passing before merge. Overall
completion is unknown for each because `inventoryComplete=false`.
#1429 and #1427 retain verified draft-ready and review-window sub-claims;
#1462 retains its unsatisfied seven-second window. Every merge-ready verdict
sub-claim remains unknown. No clone completion receipt was written.
Independent Opus review of this fix and the missing-snapshot follow-up
concludes zero actionable findings; runtime/package gates remain separate proof.

## October 14 resumed observations

The resolved main integration was preserved and committed in `286a57de1d`;
the latest retired-path command coverage repair #1710 was integrated in
`da602cef45`. PR #1574 is reopened, unmerged, and ready. The new qualification
results are recorded in
[the October 14 handoff](../handoffs/rsc-h2-completion-2026-10-14.md).

`bun run beep goals doctor` exits 0: packets=215, blocking_new=0,
blocking_inherited=0, baseline_resolved=0, advisories=5. The three targeted
packets report `completion-gate-unknown`; two unrelated legacy advisories
(`ts7-tstyche8-type-tests`, `tsc-rs-gates`) remain untouched. The original
three-unsatisfied baseline above remains the October 9 observation.

A read-only three-packet call to `observeGoalCompletion` confirms these facts:

| PR | Overall | Observed required contexts | Draft to ready | Review window | Head-bound merge-ready verdict |
| --- | --- | --- | --- | --- | --- |
| #1429 | unknown | 16 passing before merge | verified | verified | unknown |
| #1462 | unknown | 16 passing before merge | verified | unsatisfied, seven seconds | unknown |
| #1427 | unknown | 16 passing before merge | verified | verified | unknown |

All three still bind the accepted heads and merge results listed in Known
advisories. Each snapshot has `inventoryComplete=false`. No clone completion
receipt or manifest was written by these observations. Historical red
attributions above remain source-bound log comparisons; the adapter continues
to report their automated attribution as unknown.

The resumed scoped Node/V8 run passes 286 tests across 13 files. All existing
touched-file percentage floors and uncovered-count ceilings are met or improved:

| File | Lines | Statements | Branches | Functions | Comparison |
| --- | --- | --- | --- | --- | --- |
| Bootstrap.schemas.ts | 100% | 100% | 100% | 100% | unchanged, zero uncovered |
| Doctor.ts | 83.5% | 83.43% | 72.79% | 89.65% | above all four floors; uncovered 49/52/37/9 below 81/83/57/12 |
| Goals.command.ts | 50% | 50% | 100% | 0% | unchanged; uncovered 1/1/0/1 unchanged |
| Goals.schemas.ts | 100% | 100% | 100% | 100% | unchanged, zero uncovered |
| Completion.ts | 80.15% | 76.71% | 54.8% | 71.02% | new file, no existing baseline row |
| MergeGate.schemas.ts | 100% | 100% | 100% | 100% | no existing baseline row |
| MergeGate.ts | 100% | 100% | 100% | 100% | no existing baseline row |

The scoped command selects goal schema/doctor/bootstrap/command/packet/status
fixtures plus merge-gate/coherence fixtures; it uses V8 coverage and one worker.
This is a scoped read, not repository-wide coverage qualification. No baseline
was regenerated. Fallow audit/health and retired-effect-paths report zero
findings. JSDoc ratchet reports zero non-generated legacy findings; knowledge
references pass. The test compiler reports the inherited #1710 diagnostic
documented in the new handoff.

Full resumed `beep-heavy bun run beep quality package-verify @beep/repo-cli`
returns exit 0 at integrated source `da602cef45`: audit 1076.5 seconds,
docgen 30.3 seconds. This is new full-package evidence rather than reuse of
the October 9 qualification. The report-only delivery update changes no source
or fixtures. Publication and final-head hosted state are separately observed
by the worker dispatch; no local pass is presented as a hosted pass.

## October 14 review-fix qualification

The second hosted thread, `discussion_r4270037982`, correctly notes that online
reads and refresh cannot clear unknown historical inventory completeness.
Doctor now explains that limitation for missing receipts and stored incomplete
snapshots, and its legacy declaration hint promises inspection rather than
verification. The fixture supplies a merge, matching accepted head/declaration
and a positive required check, so incomplete inventory is its sole unknown cause.
It also refuses any offline GitHub access.

Focused validation passes 51 tests across the three doctor/completion files.
The full package gate at `44581cec72` passes: audit 1096.1 seconds, docgen
73.6 seconds. Independent Opus review caught an ambiguity between inspection
and persistence; the wording correction explicitly distinguishes them.
Follow-up Opus review of `ea4041cdb6` returns zero actionable findings.
The final copy correction passes package lint/check (5.0/5.8 seconds).

The final test compiler initially found TS377112 in the new fixture: use
`decodeEffect` for its statically known encoded input. `ea4041cdb6` fixes the
decoder without changing runtime validation. That failed attempt is retained;
the final dispatch records the corrected compiler and scoped coverage results.

The first published head `7912fecf03` has inherited Repo Sanity dependency-key
ordering and retired-path command fixture failures. Completed child job logs
show 2947 unit tests and 6205 coverage tests passing, with the retired-path
fixture failing; the coverage ratchet did not run, so its row attribution is
unknown. Main #1721 supplies the path repair and #1722 the repo-utils ordering
repair; H2 integrates those rather than weakening a fixture. Lint Policy's
exact log fetch returns HTTP 404 three times, so its entire attribution remains
unknown. The local knowledge-reference lane separately identifies 11 inherited
host-path observations from main #1713. Vercel statuses are acknowledged as
environment-only build rate limits. All acknowledgements preserve red/unknown
verdicts and are not waivers.

Final code qualification at `ea4041cdb6` supersedes the introduced compiler
failure: test-tsgo passes, all 51 focused tests pass, and scoped coverage
passes 287 tests across 13 files. Existing floors and uncovered ceilings are
met or improved. Doctor's final line/statement/branch/function percentages
are 84.33/84.27/74.63/90, with uncovered counts 47/50/35/9. The other existing
touched rows remain unchanged; Completion retains its new-file read above.
No baseline is rewritten. Final Fallow audit/health and retired-path law have
zero findings. The final offline doctor reports 223 packets, zero blocking
findings and six advisories: the three specified unknowns and three unrelated
legacy declarations. Reply `4270777426` resolves the hint thread; reply
`4269791012` resolves the earlier inventory thread. Final-head hosted readiness
is reported separately by the worker dispatch.
