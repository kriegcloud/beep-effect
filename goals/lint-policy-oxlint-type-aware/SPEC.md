# Deprecated-API type-aware re-spike specification

## Objective and parent

Re-spike the NO-GO recorded by `goals/lint-policy-single-digit` (completed-retained).
Prove assignment and semantic parity before changing the deprecated-API engine.
The parent history is immutable. The orchestrator owns git, publishing and completion.

## Constraints and acceptance

- Preserve CLI flags and generated script names if cutover becomes eligible.
- Every in-scope allowDefaultProject path must have a real strict project; zero unassigned
  in-scope TS/TSX files in OXC_LOG=debug is the coverage gate.
- Engagement and eight-case corpus identities must pass. Full-source differences
  must be empty or reviewed, including the parent's 13 contextual-key findings.
- Benchmark only after coverage and difference triage. Record local cold wall/RSS;
  hosted cold scan is 71s wall (job 116063131680, head 9aa802c5bb); <=150s passes.
- Use tsc-rs 0.6.0 for check/build, @effect/tsgo 0.51.1 for editor/rule surfaces.
- No git mutations, gh or Yeet commands in this implementation lane.
- Lane B has not merged: retain @typescript-eslint dependencies and shared env.
- A measured NO-GO preserves the valid precondition fixes and stops the cutover.
  An incomplete precondition is not a measured NO-GO.

## Target surfaces

Experimental projects and dedicated profile; on GO, CLI lint workers, quality tasks,
cache pilot, repo-configs exports, policy/cache inputs and their tests.

## Decision Log

| Date | Decision | Reason | How to reverse |
| --- | --- | --- | --- |
| 2026-10-14 | Use the existing bootstrapped packet, parent lint-policy-single-digit. | User lane envelope overrides explore kickoff; retired history stays intact. | Remove this new packet before publication. |
| 2026-10-14 | Test exact oxlint 1.88.0 and tsgolint 7.0.2004 without retaining manifest changes before GO. | The requested re-spike needs these versions; production pin changes depend on eligibility. | Reinstall the original lockfile after the experiment. |
| 2026-10-14 | Enumerate all 17 globs and test nearest strict tsconfig.json projects in the 27 uncovered directories. | A focused probe proves tsconfig.scripts.json alone is not auto-discovered; nearest literal projects assign both representative files. Preserve all root strict flags. | Delete only the recorded experiment-created configs; archive designs as inert research text on NO-GO. |
| 2026-10-14 | Run admitted coverage before timing. | Parent precondition prohibits repeat benchmarking before assignment and triage. | Reorder only after preconditions pass. |
| 2026-10-14 | Preserve outer concurrency and all production scripts until GO. | No performance-only cutover; script changes require reviewed cache baseline re-record. | Apply cutover and regenerate baseline after gates pass. |
| 2026-10-14 | Add drizzle.config.ts explicitly to the root lint fallback project for the experiment. | The package emission project must keep src-only rootDir; nearest ancestor root assignment works without changing emission or strictness. | Restore the recorded root tsconfig bytes on NO-GO. |
| 2026-10-14 | Keep the dedicated profile at repo root and discard the misplaced-profile scan. | Scope/ignore globs resolve relative to the config location; engagement requires ten corpus findings. | Re-run with a relocated profile only after adjusting and proving its scope. |
| 2026-10-14 | Treat the .d.ts glob match as excluded; 37 of 38 matches are lint subjects. | Both profiles ignore **/*.d.ts; requiring it as a lint subject would widen the law. | Change both scopes explicitly and rerun coverage if declaration linting is adopted. |
| 2026-10-14 | Record NO-GO; defer benchmark and full sharded baseline after clean-scan failure. | Built candidate still exits 1 with 305 native config errors and eleven unremediated production differences. Timing before repaired preconditions violates the parent decision. | Remediate named sites, rerun clean scan and full parity, then benchmark and reconsider GO. |
| 2026-10-14 | Orchestrator ruling: the prior record is preconditions incomplete; gates not yet run, not a second NO-GO. Clear named blockers in the tracked tree before benchmarking. | Binding parent p2b-re-spike-precondition requires assignment and triage first. Only hosted cold wall >150s, unreviewed parity differences, or unassignable strict coverage may yield NO-GO. | Supersede with measured gate evidence; retain independently valid fixes even on measured NO-GO. |
| 2026-10-14 | Restore all experimental projects, root fallback and corpus; retain inert evidence only. | User requires docs-only NO-GO publication and no production cutover. | Reconstitute from research artifacts in a new reviewed candidate. |
| 2026-10-14 | Retain htmlEntities while reporting its migration blocker. | Installed replacement declaration accepts options but runtime calls decoder instance methods; mechanical migration breaks caption parsing. | Repair/upgrade the boundary and prove entity behavior before replacing the deprecated option. |
| 2026-10-14 | Materialize nearest strict candidate projects, broaden two test rootDirs, port compatibility mock suppressions and remove dead Accordion controls. | Resolve actual assignment/configuration/source preconditions without lowering strictness or changing mock runtime behavior. | Revert the individually recorded source/config hunks; restore the prior lint engine if qualified cutover regresses. |
| 2026-10-14 | Keep htmlEntities with a narrow class (c) suppression naming fast-xml-parser 5.11.2 entityDecoder declaration/runtime mismatch. | Installed options-shaped declaration is not runtime-compatible: the parser calls reset/decode on the supplied object. Preserve existing caption/entity limits; regression-test caption expansion. Upstream issue receipt is research/xml-entity-decoder-issue.md. | Remove suppression when an upstream-compatible replacement passes caption entity/limit tests. |
| 2026-10-14 | Make the doctest fixture a strict no-emit noncomposite check project rooted at the repo; add the fixture add function pipeable overload. | Imported shared Vitest config must be within rootDir, noncomposite avoids emission-only file-list restrictions, and the inherited Effect rule reports a real missing overload. No strict flag is lowered. | Restore the fixture config and function together, then rerun fixture/owning doctest proofs. |
| 2026-10-14 | Remove deprecated ts-morph baseUrl in the parity test and use an explicit relative paths target. | Clean assignment exposed this previously masked use; paths resolves from the in-memory project root without baseUrl. Verify checker-backed parity tests. | Restore the option only with a reviewed compatibility suppression if upstream resolution changes. |
| 2026-10-14 | Supersede the XML mismatch interpretation with a tested EntityDecoder instance replacement; remove htmlEntities and its suppression. | Installed fxp.d.ts EntityDecoderOptions describes instance methods. Match upstream maps, numeric decoding, 100000-character expansion limit and unsafe-input hook. Seven differential cases agree; add caption integration cases for named/numeric/DOCTYPE/limit behavior. The previous options-object reproducer tested an invalid API shape, not an upstream bug. | Restore htmlEntities if the replacement fails the entity behavior contract, with a narrow class (c) suppression and exact regression evidence. |
| 2026-10-14 | Expect retained caption DOCTYPE fixtures to fail the existing evidence boundary. | The parser itself decodes safe DOCTYPE entities, but Library.evidence.ts explicitly rejects <!DOCTYPE/<!ENTITY before parsing. Preserve this original rejection rather than widening caption acceptance; named/numeric built-ins stay accepted and expansion-limit cases stay rejected. | Change only with an explicitly tested caption validation policy migration. |
| 2026-10-14 | GO for local cutover after measured coverage/parity gates; hosted <=150s stays pending for orchestrator. | 36 uncached ESLint shards and full Oxlint both have zero findings; corpus ten identities per engine; all 37 subjects assigned. Four-thread cold wall 60.54s and peak RSS 12308852 KiB. Do not call local timing hosted proof. | If hosted >150s or a new unreviewed semantic difference appears, retain precondition fixes and restore the ESLint lane via the recorded engine hunks. |
| 2026-10-14 | Use one four-thread Oxlint process for full/hosted sweeps; affected runs keep the existing bounded Turbo package selection and caller base. Replace internal sweep selector shards with oxlint, preserve turbo override. | Bound native resource use; full hosted/local lane body remains command-identical and no ESLint shards survive. Current main already uses sequential aggregate phases with four-worker Turbo graphs; do not increase concurrency further. | Restore the worker/selector and engine config together, preserving caller base tests and precondition fixes. |
| 2026-10-14 | Retain typescript-eslint deps, shared BEEP_ESLINT_PROFILE declarations and cache pilot environment scenarios until lane B. | Docs profile still uses the parser; B has not merged. Add a narrow Knip dependency hold for the now-unused ESLint plugin, with B-owned removal. | Remove the hold and shared env only with B cutover, then rerun cheap gates and cache audit. |
| 2026-10-14 | Re-record all 153 cache subjects against the reviewed packet basis; retain qualification scope/profile/epoch. | Shared native lint input declarations and fingerprint changed. Cache baseline CAS review records existing posture, grants no qualification; package script generation writes zero manifests. | Restore the engine/input hunks and perform a superseding reviewed CAS baseline record. |
| 2026-10-14 | Final coverage-reconciled GO for local cutover after measured coverage/parity gates; hosted <=150s stays pending for orchestrator. | 38 uncached ESLint shards and full Oxlint both have zero findings; corpus ten identities per engine; all 37 subjects assigned. Four-thread cold wall 60.54s and peak RSS 12308852 KiB. Do not call local timing hosted proof. | If hosted >150s or a new unreviewed semantic difference appears, retain precondition fixes and restore the ESLint lane via the recorded engine hunks. |
| 2026-10-14 | Format all strict candidate configs; use temporary attributed inbox acknowledgements only under the harness P0 directive. | Owning package audits found JSON formatting introduced by candidate serialization. The higher-priority harness requires ack, but the envelope forbids committing a fix SHA; temporary waivers do not prove quality. | Config formatting is reversible; waivers expire at 2026-10-15T00:00Z. Require passing reruns before orchestrator publication. |
| 2026-10-14 | Refresh the line-only schema advisory inventory and normalize packet phase statuses to complete. | Four caption regression cases shifted an existing seven-codec advisory; no new advisory or strictness change. GoalManifest requires complete, not the old bootstrapped completed value. | Regenerate inventory after reverting tests; preserve the schema-valid phase domain on any rollback. |
| 2026-10-14 | Preserve the existing schema codec exception verbatim after generated line movement. | The writer matched exceptions by the old line and reset this fixed provenance regression suite to advisory. Only its source line moved; copy the original status/reason, retaining identical scope and 126 entries. | Revert the line movement with the source; do not broaden exception identity or refresh unrelated rows. |
| 2026-10-14 | Keep capability edges empty in the packet manifest; retain narrative requirements in SPEC/README. | GoalManifest provides/requires fields are namespace/name capability slugs, not prose deliverables. No formal provider dependency was selected by this lane. | Add actual capability edges only after matching their existing provider definitions. |
| 2026-10-14 | Replay full policy locally with the supported concurrency override 2 after an admitted OOM. | The unit journal confirms SIGKILL/oom-kill, not a semantic scanner failure. The current policy schema supports 2/3/4; 1 would silently fall back to 4. Avoid shared slot changes or cancellation of other lanes. | Drop the local override when resource capacity is available; hosted/local CLI command bodies and strictness remain unchanged. |
| 2026-10-14 | Construct the replacement parser/decoder per parse, matching legacy decoder lifetime. | A shared custom decoder retains XML 1.1 across documents; the old htmlEntities factory resets to XML 1.0 on every parse. Reproduced with XML 1.1 then a declaration-free numeric control reference. Add sequential caption integration cases and keep the replacement behavior-equivalent. | Retain per-parse isolation unless a tested upstream reset contract covers XML version as well as entities/counters. |
| 2026-10-14 | Preserve empty-lab tolerance with Oxlint no-error-on-unmatched-pattern only when every target matches the existing LabsWorkspaceDir guard. | Native Oxlint otherwise exits 1 on an empty target; the retired ESLint worker explicitly tolerated only lab targets. Reuse the schema guard, keep non-lab empty scopes strict, and test both flag routing and native exits. Full/hosted command arguments and the measured gate are unchanged. | Remove the conditional only with a reviewed change to lab-empty semantics; never apply it to all package scopes. |
| 2026-10-14 | Attribute the completed full-policy JSDoc red to unchanged main source and hand its consolidated repair to the orchestrator. | Ratchet counts 427 > 426 and unsafe examples 2 > 0 originate in #1671/#1700; all other tasks pass. Repo law forbids copying inherited repairs into each lane. | Reattribute only with source-bound contrary evidence; rerun the root proof after the main unblocker lands. |
| 2026-10-14 | Evaluate the hosted >150s rollback trigger: not triggered; hosted cold scan took 71s wall. | Heavy / Lint Policy job 116063131680 on 9aa802c5bb ran lint:deprecated-apis --full with --threads=4, 20:06:46Z–20:07:57Z, reporting no deprecated vendor API usage found. No RSS logged and no OOM; memory sizing remains lane F. Earlier pending entries are historical and superseded by this measurement. | Restore ESLint engine hunks if a subsequent qualified hosted cold scan exceeds 150s or semantic parity regresses; retain assignment fixes. |
| 2026-10-14 | Fail closed on unmatched TS/TSX/MTS/CTS from captured OXC_LOG=debug worker output; include labs files and give plugin-test and ai-provider-cli/test/fixtures nearest strict projects. | Native 1.88.0 / tsgolint 7.0.2004 exits 0 despite Total programs: 1. Unmatched files: 1 and an absolute Unmatched file: path. Check every emitted TS path, exclude non-TS, and reject truncated evidence. Full scan also exposed four managed-peer TS fixtures added since the prior coverage proof; give them a strict nearest owner extending their existing test project. Labs tolerance applies only to empty target globs; the old ESLint profile linted labs. Preserve package/full/base routing. | Revert the guard and both nearest projects together only with an equivalent fail-closed assignment proof; retain strictness and rerun full coverage. |

## Current acceptance evidence

- [x] All 37 eligible default-project subjects assigned without weakening strictness.
- [x] Review-wave full scan: 204 programs; zero unmatched TS/TSX/MTS/CTS files.
  The 15 unmatched non-TS inputs are outside this law; labs TS files remain in scope.
  CLI regression suite passes all 22 tests, including native assigned/unassigned fixtures.
- [x] Both rootDir projects and every source difference repaired and regression-tested.
- [x] Full normalized parity: 38 uncached shards, all 5200 typed subjects; empty diff.
- [x] Corpus parity: ten normalized identities per engine, empty diff.
- [x] Local cold four-thread wall 60.54s; peak RSS 12308852 KiB.
- [x] Native worker cutover, fingerprint/script regeneration and reviewed cache baseline.
- [x] All 26 owning package proofs pass; CLI default audit 1167.3s and docgen 40.7s.
- [x] Root deprecated-apis passes; full policy completes with inherited JSDoc-only failure attributed below.
- [x] Hosted <=150s timing: Heavy / Lint Policy job 116063131680, head `9aa802c5bb`,
  `lint:deprecated-apis --full`, `--threads=4`, 20:06:46Z–20:07:57Z (71s wall),
  "no deprecated vendor API usage found". No RSS logged and no OOM; lane F owns memory sizing.

## Verification

The original run's evidence is research/verification.jsonl. Resumed commands and
exits are research/verification-resume.jsonl; measured gates are
research/gate-results-resume.json. The original NO-GO decision is preserved above
next to its reclassification, and in the dated history record. Publication and
packet completion remain orchestrator-owned; no lane git mutations or Yeet.

## Verification repair receipt

Desktop quick proof and repo-configs full audit exposed Biome formatting in the
new nearest projects. Format all 27 candidates and both repaired test configs;
rerun the failed owning proofs. The harness issued higher-priority P0 acknowledgement
instructions, overriding the lane no-Yeet envelope only for inbox ack. Initial
--observed was rejected because package failures are not proof-job notification rows.
Temporary attributed waivers expire 2026-10-15T00:00Z and do not count as passing proof.
The lane must retain passing re-run evidence; orchestrator still owns all git/publishing.
