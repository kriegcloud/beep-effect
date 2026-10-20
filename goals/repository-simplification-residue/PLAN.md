# Repository simplification residue plan

Status: `in-progress`. Lifecycle: `active`.

## Phases

| Phase | Status | Exit |
| --- | --- | --- |
| P0 Research and admission | in-progress | Issue acceptance and source paths reconciled; lane owners and fresh cap admission recorded. |
| P1 Implement waves | pending | All fifteen issue-owned implementations land with their acceptance proof. |
| P2 Verify program acceptance | pending | Fresh scans and all per-issue/runtime/coverage receipts reconcile; zero added inventory rows. |
| P3 Yeet and merge | pending | Final work passes the fleet-owned S11 thread/window/conflict gate and merges. |
| P4 Close | pending | Reflection validates; acceptance, phases and completed-retained lifecycle land together in the final PR. |

## Admission and wave order

Count **every open PR repo-wide**, drafts and unrelated programs included, before
admitting any wave or publishing another PR. The cap is six (repair-decision-3).
The fleet orchestrator grants capacity; plan for one or two residue lanes in
flight, not six dedicated slots. At a full cap continue local preparation and
verification. Do not publish until capacity is granted. Keep active work bounded
and make progress on independent admitted work under S23.

| Wave | Issues and lane names | Execution and exit |
| --- | --- | --- |
| 1 | #1851 `residue-a-retire` with #1860 `residue-catalog`; #1855 `residue-detectors` | One coordinated A/catalog retirement train plus an independent detector lane, at most two concurrent PRs when fleet capacity allows. Detector FIRST item is F-S31-EV010: paired fixtures and classification repair for all three models-apply-command/models-apply/models-catalog provenance findings, never exceptions. Then remaining detector/provenance work. |
| Deadline lane | #1861 `residue-hold-exits` | Reserve the next available slot after initial wave admission; start preparation immediately and land before 2026-10-30, with OSV recheck and evidence-backed resolution/renewal. It may interrupt later wave order to meet the deadline. |
| 2 | #1853 `residue-patch-proofs` | Current-version five-patch fail-unpatched/pass-patched train, with hashes and recovery. |
| 3 | #1856 `residue-guidance` | Reconcile every guidance/artifact preview to current source/reference before applying. |
| 4 | #1875 `residue-vitest-canon`; #1876 `residue-rdf-pacer` | Preserve original patches/identity maps and D13 tooling isolation; separate package/dual-runtime/coverage proof; coordinate detector overlap with #1855. |
| 5 | #1869 `residue-telemetry-completeness` | Separate completeness from qualification, including historical compatibility and malformed/refusal fixtures. |
| 6 | #1874 `residue-build-restore` | Agree file ownership with the separately owned build-pipeline exploration; cold/warm/changed-input SHA-256 output manifests. |
| 7 | #1878 `residue-completion-evidence` | Complete merge-time evidence provider; retain unknown for missing/deleted/partial evidence. |
| 8 | #1879 `residue-target-exchange`; #1880 `residue-exchange-recovery`; #1881 `residue-skill-publication` | Qualify target filesystem capability first, then journal recovery, then skill publication. At most two PRs when admitted; shared protocol files have one owner and sequential integration. Disposable target fixtures only, no implied native apply. |
| 9 | #1882 `residue-dependency-review` | Manifest-aware security integration and actual permission fixtures, retaining production transitive detection. |

Workstream status: #1860 `residue-catalog` is complete (third A-train PR,
`history/receipts/catalog-removals-record.md`). #1853 `residue-patch-proofs` is
complete (`history/receipts/patch-proofs-record.md`): all five retained patches have
a focused test and a current-version fail-unpatched/pass-patched pair, and none has
a published upstream exit.
#1861 `residue-hold-exits` is
complete (`history/receipts/hold-register.md`), ahead of the 2026-10-30 deadline.
#1851 continues in the A-train.
#1856 `residue-guidance` is in progress: wave 1 classified and fixed the
guidance surface (`history/receipts/guidance-classification.md`). Wave 2 reviews
the 660 inline directives individually; wave 3 adds a compile check for the 324
Markdown TypeScript fences and decides the three upstream-copied `.patterns` files.
#1875 `residue-vitest-canon` is in progress after wave 1, which leaves 689 open rows
(`history/receipts/vitest-canon-wave-1.md`).
#1876 `residue-rdf-pacer` is complete (`history/receipts/rdf-pacer-ports.md`): the
RDF failure assertions and the Pacer logout witness are ported, and every export
hunk has a disposition.
#1869 `residue-telemetry-completeness` is complete
(`history/receipts/telemetry-completeness.md`): stored session stamps carry
independent completeness and qualification fields, historical rows decode as
`unknown`, and a run that cannot evaluate a session keeps its verified stamp
while the session's own contradicting evidence still clears it.
#1874 `residue-build-restore` is complete (`history/receipts/build-restore.md`): the
base incremental state lives inside `outDir`, so a dist-only clean can no longer leave
state that suppresses emit. Cold, warm and changed-input builds reproduce the complete
output manifest.
#1878 `residue-completion-evidence` is complete
(`history/receipts/completion-evidence.md`): completion verifies only on a merge-push
rule suite bound to the merge commit and green required checks at the accepted head.
Network failures, unrecoverable deleted rulesets and partial evidence stay `unknown`.
The five subject-only packets stay unmigrated, each with its reason.

Workstreams are one per issue even when a train shares a PR. Future owners must
record source acceptance and head-bound results per issue. Slot availability
changes concurrency, not ownership or acceptance. Size alone cannot park a lane.

## External measurement regime

#1868 is a cross-reference, not a sixteenth lane. Its 30-session window restarts
at **#1884's merge** (e4d6f44aa8), because deleting `.ai/mcp` changed the harness
regime. Count only qualifying native root sessions under the resulting fingerprint;
children, synthetic probes and historical samples contribute zero. Later relevant
configuration changes restart their own regime again. No arbitrary wait replaces
an executable step.

## Per-wave receipt and closeout

Record exact source head, issue acceptance, commands/results, inventories compared,
added rows (must be zero), coverage floors, generated-owner checks, hosted status,
red attribution and reversal in history/. Preserve original source patches and
native recovery material. Answer review threads through the owner; the fleet
orchestrator owns S11 merges. Count open PRs again before admitting replacements.

At final program closure reconcile all fifteen acceptances, use /reflect for a
validated history/reflections artifact, run reflection-artifacts, update README
and manifest phases, and land completed-retained in that same final PR. Opening
this packet leaves every implementation acceptance outstanding.
