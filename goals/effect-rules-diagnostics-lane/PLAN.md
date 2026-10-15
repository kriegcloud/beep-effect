# Effect diagnostics lane plan

Status: blocked at P2 on inherited / checkout-state verification. Implementation
is complete and uncommitted. The packet lifecycle stays active; the orchestrator
owns review, commits, publication and completion.

| Phase | Status | Outcome / remaining work |
| --- | --- | --- |
| P0 Research and spike | complete | GO; see history/2026-10-14-spike.md. |
| P1 Implement | complete | 0.53.0 pins, independent heavy lane, severity policy, source repairs, major changeset and runbook. |
| P2 Verify | blocked | Required commands executed; inherited AgentMessage findings and HEAD/live inventory mismatch remain. |
| P3 Orchestrator publication | pending | Review and commit the diff, integrate the owning AgentMessage fixes, rerun the blocked proofs. |
| P4 Orchestrator close | pending | Lifecycle completion and reflection after merge; H2 does not perform this phase. |

## Final verification

Heavy commands ran through beep-heavy with the required user-manager environment.
Raw logs remain in the private H2 cache; the lane report records every command.

| Command / surface | Exit | Result |
| --- | --- | --- |
| Full dependency build | 0 | 153 tasks, 74.093s. Post-implementation dependency closure: 60 tasks, 22.137s. |
| Standalone 0.53 spike | 0 outer | 288 attempts; 287 workspace targets plus one empty fixture. 1,423.881s, 8,109,752 KiB max RSS. |
| tsc-rs comparison | 0 outer | 132.424s, 3,002,820 KiB; no shared-rule findings in workspace targets. |
| Profile corrections / positive canary | 0 outer | Drizzle exception preserved; common-rule codes/messages/locations match across three compiler paths. |
| Initial and final `bun run check` | 1 / 1 | Typecheck phases pass. Final lane completes all 291 projects / 72,975 file visits; exactly one inherited strictEffectProvide finding, zero new-rule findings. Legacy test-tsgo reports the same source finding; smoke passes. |
| Preserved 0.51.1 CLI test compile | 1 | Same AgentMessage.runtime.test.ts:322 / TS377032. |
| package-verify repo-cli | 1 | Audit: 6,526 pass, three initial failures. Two routing expectations corrected and focused tests pass. Remaining archive/live packet mismatch needs an orchestrator commit. Docgen passes. |
| package-verify repo-configs | 0 | Audit and docgen pass. |
| package-verify observability | 0 | Audit and docgen pass. Separate catalog regression: 33 tests pass. |
| package-verify effect-drizzle | 1 → 0 | Reflective SQL error fixtures migrated to sqlName; fresh full proof passes. |
| package-verify semantica | 1 → 0 | Explicit R.has string-key view fixes the deliberate missing-key assertion; fresh default audit passes (no docgen configured). |
| package-verify oip-web / todox --quick | 0 / 0 | Configuration-only lint and check pass. |
| Final CLI package-scoped docgen | 0 | Current command registration Example compiles. |
| Compiler/severity policy tests | 0 | 9 tests pass. |
| Heavy Check routing tests | 0 | 3 tests pass; 252 unrelated cases filtered. |
| Three CLI repair test files | 0 | 49 tests pass. Root Vitest does not select the catalog package; its own scoped run covers that separately. |
| Catalog regression | 1 → 0 | Corrected assertion to the public schema identifier; 33 tests pass. |
| Doctest metadata verification | 1 → 0 | CLI Command.make conservatively classified as child-process; complete Example retained compile-only. |
| Extra tsgo-rules parity | 1 | Only AgentMessage.store.ts:200's unchanged disallowed directive remains; new profile drift fixed. |
| Nine requested cheap gates | 0 each | Latest Effect Vitest run passes after reviewed locator-only refresh; fingerprint/cache audits pass afterward. All other final gates pass. |
| Packet size / JSON / whitespace | 0 | GOAL within 4,000 characters, manifest JSON valid, diff clean. |
| Session ledger note | 1 | No explanatory diagnostic; durable packet and private report preserve the handoff. |

## Reviewed inventory update

Effect Vitest's equivalent A.join fixture construction changes one enclosing
EV014 occurrence. Only writer-generated locator metadata in four H2-owned files
is retained: 16 fields, no row/status/severity/semantic changes. Unrelated writer
cleanup is excluded. See research/effect-vitest-inventory-review.md.

## Runtime-required inbox receipts

The runtime guard required local-shard acknowledgement despite the lane's no-Yeet
instruction. Observed-only acknowledgement is not accepted for package shards.
Semantica/drizzle got one-hour scoped receipts, now backed by passing fresh default
proofs. The remaining CLI audit row is attributed to archive/live checkout state.
No git mutation or publication was performed.

## Orchestrator handoff

Commit the H2 packet before rerunning the HEAD-archive versus live-filesystem
knowledge-doctor comparison. Integrate the AgentMessage owner's runtime/store
fixes and rerun root Check plus tsgo-rules. Review the major observability payload
migration and the compile-only Example note. Keep the lifecycle active until
publication/merge closeout under the orchestrator.

## Amended performance wave (2026-10-14)

- [x] Preserve the pre-wave diff and split public observability rename as a cache patch.
- [x] Add typed bounded concurrency and environment override.
- [x] Add affected workspace/dependent selection and coverage-independent graph mode.
- [x] Move the full sweep to its own hosted heavy job with a 19-GiB cap.
- [x] Defer schemaClassMissingBrand activation to the schema-opaque-default closing PR.
- [x] Measure full runs at 1, 2, 4 and 6 workers on CPUs 0-7 and select a default.
- [x] Finish fresh default CLI package proof; all other affected/full/cheap proofs are complete.
- [x] Replace the lane report Performance wave section and hand off without git mutation.

AgentMessage.runtime.test.ts:322 is fixed on main by #1792 per orchestrator;
this lane does not merge main. AgentMessage.store.ts:200 stays with its owner.

### Current performance-wave proof

Four lane/CI files: 378 tests pass. Workflow service-cap proof: 31 pass.
Selection fixture warning repaired: 11 pass. Scheduler/manifest/graph/planner
repairs: 230 pass, including handoff fixture without update mode. All eleven
amended cheap/audit/catalog gates pass in perf-final-verification.jsonl.
Six other packages pass quick proof. Fresh default CLI proof is running after
its introduced seed/phase/list issues were repaired; the untracked-packet
HEAD/live comparison still requires the orchestrator commit.

C1 full CPU-limited sweep: 291 projects, 1497.811s, max RSS 8,710,800 KiB,
peak sampled tree RSS 9,319,332 KiB. The one H2 unused-directive fixture warning
was repaired; later concurrency sweeps verify the final census.

All tuning runs complete: 1497.811s / 717.407s / 381.481s / 302.028s.
Default 2 wins the capacity-safe set; 4/6 exceed the 19.2-GiB budget.
Final default CLI audit: 6535/6536 tests pass, docgen passes; only the known
HEAD/live untracked packet mismatch remains. The final capped hosted PR replay
selects all 291 projects and is running; post-review cache audit is green.

### Complete-census correction

The earlier performance summaries missed three H2 shared-rule findings. Both
exported helpers now have dual overloads; typed CLI options use decodeEffect.
Twelve focused tests pass. A direct two-project CLI diagnostics recheck confirms
1,586 check files clean and only the inherited test finding across 327 test
files. All eleven amended cheap/audit/catalog gates pass again after repair.
The repaired capped full-inventory replay and default CLI proof are still running.
Historical tuning timing/capacity data remains valid; census history is corrected
in SPEC and research/performance-wave.md.

Repaired capped hosted replay: 793.080s, 12.38 GiB kernel job peak, all 291
projects / 72,975 file visits. Independent raw/census assertion passes: exactly
one inherited strictEffectProvide, no H2 findings. The focused CLI diagnostics
check agrees. Only the fresh default CLI package proof remains running.

## Performance-wave handoff

Implementation and measurements are done. Final default CLI proof returns 1
solely for the untracked-packet HEAD/live equality check: 6,536/6,537 tests pass;
docgen passes. Repaired capped full-inventory replay: 793.080s / 12.38 GiB kernel
peak, only the inherited AgentMessage finding; complete-census assertion passes.
All eleven repaired cheap/audit/catalog gates pass; all six other packages pass
quick proof. Source/manifest/scheduler/helper repairs are verified.

Orchestrator merges main (#1792), commits the packet and reruns CLI audit, routes
AgentMessage.store.ts:200 to its owner, and publishes the catalog rename patch
as a separate major-change PR. No main merge or lane commit was run here.
Lifecycle remains active, P2 in-progress, P3/P4 pending. Session ledger command
returns 1 without a diagnostic; the external report and packet are the handoff.

### Final amended-wave verification table

| Command / scope | Exit | Result |
| --- | --- | --- |
| taskset 0-7 full tuning, concurrency 1/2/4/6 | 1 each | 291 projects each; timing/capacity table in SPEC; historical H2 findings repaired |
| capped hosted PR replay, default 2, --base origin/main | 1 | 793.080s, 12.38 GiB kernel peak, 291 projects / 72975 visits; inherited only |
| independent raw/census/coverage assertion | 0 | exactly strictEffectProvide:1, no H2 findings |
| focused CLI diagnostics --filter @beep/repo-cli | 1 | source check clean; inherited test finding only |
| default package-verify @beep/repo-cli after repair | 1 | 6536/6537 tests pass, docgen passes; HEAD/live untracked packet mismatch |
| six other touched packages, package-verify --quick | 0 each | observability, effect-drizzle, semantica, repo-configs, oip-web, todox |
| lane/CI, scheduler/manifest and repaired helper tests | 0 each | 378 + 230 + 12 cases; workflow rechecks 31 pass |
| all eleven amended cheap/audit/catalog gates | 0 each | complete list and argv in external perf-repaired-verification.jsonl |
| tsgo-rules policy parity | 1 | only other-owner AgentMessage.store.ts:200 directive |
| git diff --check, Biome, packet/manifest/basis guards | 0 | source and packet coherent; lifecycle active |
