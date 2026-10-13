# Preparation friction ledger

## 2026-10-09 — Generated Pulumi SDK must be built before full type checking

The full-scope baseline check failed in `@beep/infra`: TypeScript resolved the
generated `@pulumi/gharunners` source because its compiled `bin` outputs were
absent. The resulting `TS1295`/`TS1287`/`TS1294` diagnostics concern the generated
dependency, not changes from this initiative. Its existing supported build
completed without tracked source edits. Full-scope check is being rerun after
that environment preparation; the build alone is not a passing check.

Prevention: make the generated SDK build an explicit fresh-checkout prerequisite
before infrastructure type checking, as the existing coverage script already
does. Preserve the first failed scope receipt and bind any later success to the
same source head and disclosed setup.

## 2026-10-09 — Muse does not support Graft's required named tool choice

Muse minimal generated the two tiny file summaries, then rejected Graft's named
concept-synthesis tool choice with HTTP 400: only `auto` is supported. The
bounded guard stopped further upstream requests; local retry errors do not
represent a provider quota exhaustion. A one-request diagnostic retained the
exact provider response after the first guard obscured it with its local cap
error. The incomplete deep fixture is retained and is not ingestion-ready.

The already-authorized lightweight GPT-5.6-Luna medium route, using the same
active Codex account through an isolated proxy, completed all five fixture
requests, deep build, sync check and caller query. No tool-choice weakening or
pipeline-depth reduction was applied. This establishes tiny-fixture compatibility;
source-checked summary quality and corpus readiness remain separate gates.

## 2026-10-09 — Fresh-lane declarations and process-test clocks

The first runner package check cascaded `TS6305` because referenced dependency
declarations were absent in the fresh lane. Building the referenced project
closure repaired that precondition; the later package verification is a separate
receipt. Introduced focused-test failures also exposed Effect v4 API differences,
a receiver-bound file write method and a fake clock in a process cleanup test.
The repaired eleven-test set passes, including private full-stream capture and
cleanup of a child that ignores TERM.

Prevention: inspect the live Effect reference API, build the needed declaration
closure, and use the live clock for subprocess integration tests. Keep initial
failures rather than recording only the successful repair.

## 2026-10-09 — Fresh-process acceptance must be exercised positively

The first complete retention canary exposed mixed Effect source/dist imports in
the rebuild child. A valid encoded timestamp was rejected before the intended
assertion. Launching a distinct Vitest process with the same candidate-resolved
aliases fixed the harness: the full positive fixture passes 25 tests, including
delete/rebuild and the separate-process child. Wrong-behavior canaries remain
required. This is acceptance-harness proof, not a retention implementation.

Prevention: test the full evaluator path with a known-correct private fixture,
including child process and persistence, before freezing acceptance.

## 2026-10-09 — Identical base/head leaves affected proof lanes empty

The canonical full baseline proof dispatches several hosted lanes with
`--affected --base origin/main`. At the identical pinned main head, the logs
show zero tasks for some lanes. Other policy lanes do run repository-wide.
An empty affected lane cannot establish whole-repository baseline health.
Retain the canonical proof and supplement its affected lanes through the
supported `beep ci lane` interface without `--affected`, with full docgen
mode. No baseline-green claim is made until both proofs are complete.

Prevention: expose a supported common-baseline full-scope mode in the canonical
proof planner, while preserving ordinary PR affected scope.

## 2026-10-09 — Model-dependent query needs matching project identity

The first Code-Graph-RAG Muse probe failed because the test forwarder added
chat-completion fields to a Responses request. Correcting the request to
`max_output_tokens` and `reasoning.effort` produced HTTP 200, but no known
function row: the direct fixture builder used its directory basename while
the MCP generator derived a path-qualified project identity. Both attempts
remain retained with raw responses and usage; neither passes quality.

Prevention: build fixtures through the same documented project identity route
as the server, inspect both graph and model-prompt scope, and require the
known-answer row rather than accepting HTTP 200 or `isError: false`.

## 2026-10-09 — File isolation does not isolate local network services

Native subscription CLIs need egress, but sharing the host network also makes
other arms' loopback databases and IDE servers reachable. The runner must not
treat filesystem masking or an attestation boolean as denial evidence. A
network namespace plus exact-endpoint UNIX-socket broker passed synthetic
allow/deny canaries; native authentication and assigned-tool bridges remain
separate admission gates. No model ran in that synthetic canary.

Prevention: predeclare the egress capability alongside mount capabilities,
then exercise direct-socket and proxy bypass denial before coding admission.

## 2026-10-09 — Detached baseline proof needs the user-manager environment

The first detached baseline full-verify launch refused because the invoking
shell lacked `XDG_RUNTIME_DIR` and `DBUS_SESSION_BUS_ADDRESS`, although the
uid1000 user manager was active. No proof ran on that first failure. The owning
orchestrator retried with `XDG_RUNTIME_DIR=/run/user/1000` and
`DBUS_SESSION_BUS_ADDRESS=unix:path=/run/user/1000/bus`; the baseline proof is
running in its separate clean baseline worktree, with terminal outcome pending.

Prevention: detached proof startup should resolve or validate the existing
user-manager environment before reporting it unavailable. This is environment
friction, not a repository test failure or a passing verification receipt.
Retain both launch attempts and terminal proof evidence in protected artifacts.

## 2026-10-09 — Fixture readiness required complete plugin dependencies

Understand Anything's first bounded host attempts stopped at ignore confirmation
and then missing `graphology` after a core-only install. The operator's existing
routine-ignore authorization was made explicit; a complete frozen workspace
install repaired the missing plugin dependency. Both incomplete attempts remain
receipted. A separately authorized repaired public-host generation and fresh
query passed; see [readiness](READINESS.md) and its protected receipt hashes.

Prevention: smoke the actual documented batching/extraction/plugin scripts,
not only a library import or version command, before a costly host invocation.
The read-only host sandbox also exposed login-shell/heredoc temporary-file
friction, recovered within the same repaired pilot using writable fixture paths
and direct commands. Preserve the recovery evidence and cost; do not silently
reclassify preparation failures as successes.

### Optional semantic dependencies were not exercised by structural startup

Graphify's native deep semantic client stopped before a model call with
`ModuleNotFoundError: No module named 'openai'`; its structural startup fixture
had passed. Receipt: `runtime/semantic-native-muse-fixture.json` in protected
readiness staging. Prevent recurrence by making readiness enumerate and probe
optional dependencies for every admitted full-depth phase, not just the CLI
entrypoint. Preserve the frozen base environment; any supplemental provider
closure needs its own exact pins and compatibility proof before corpus freeze.

### Evaluator configs carried authoring-checkout paths

The sidecar and retention proposed acceptance configs imported their authoring
checkout, and the fresh-process retention test wrote its child receipt beside
the suite. Before freeze these paths were made candidate-relative and output
was separated. The correct 25-case fixture and wrong-axis/mutation/canonical
fixtures retained the same 0/8/2/1 failure counts; sidecar retained 25 passes and
26 attributed semantic failures. Prevent recurrence with an empty-root namespace
canary at canonical candidate/suite/output mounts. Host portability alone does
not prove evaluator containment; that check remains pending.

### Canonical paths must precede capability exclusion

Independent runner review round2 found that raw prefix checks could admit a
private-path alias containing `..` before hashing canonicalized it. Repair now
requires exact absolute canonical paths before comparison, hashing, copying or
mounting, with descendant/ancestor/double-slash canaries. Receipt:
`runner-independent-review-round2.json`. Prevention: canonicalize before every
capability decision, not merely before reading bytes.

### Native identity and final-commit proof need separate bindings

The same review showed different-model Claude/Grok streams could produce complete
usage under a declared model label, and ignored required source could pass tests
while being absent from a retained commit. Bind observed identity with its native
provenance, preserve unknowns, reject contradictions, and reconstruct final proof
inputs from retained commits. Neither token completeness nor clean Git status
proves those properties. Fixes and productive collector validation remain open.

## Full-scope baseline exposed inherited coverage floors

On 2026-10-09, the clean candidate `df7d88aad7` passed canonical full Yeet,
full check, unit tests and integration tests. Supplemental unscoped coverage
ran every shard successfully but rejected four metrics in two existing CLI
files: Accounts.command branches `75 < 100`; EffectImports functions
`89.34 < 90.17`, lines `92.36 < 92.52`, statements `92.02 < 92.13`.
Evidence: private `baseline-full-scope-continued/coverage.log` and receipt.
The full-scope supplement remains failed, with source freeze withheld.
A live `rsc-burndown` lane already owns related EffectImports repairs; its
work is preserved. Explicit full-scope baseline proof before freezing avoided
copying an inherited coverage defect into 117 coding cells. Next: complete
remaining baseline lanes, reconcile the existing repair and select/prove one
common main snapshot before corpus ingestion.

## Preserve package-level verification controls

Pre-freeze review found the initial sealed framework inventory protected the
root and tooling implementation, but omitted other workspace audit scripts,
verification configuration and coverage floors. A candidate could change these
and produce a misleading pass. The revised guard freezes 152 workspace manifests
except declared new public exports, verification files, doctrine, symlink targets
and configuration inventories. Offline canaries reject script/dependency/floor
changes, added environment configuration and new framework files, while accepting
valid public-export additions. The clean standalone reconstruction passes all
3,240 checks. Private evidence: `framework-workspace-controls-canary-*/receipt.json`
and `portable-framework-v2-reconstruction.json`.

## Project dependency links into the committed reconstruction

A whole read-only donor worktree includes ignored dependency/build state. Native
workspace links must instead resolve inside the exact committed reconstruction;
for example `node_modules/@beep/acp` points to its fresh source package and the
tsgo link points to its fresh shim. The collector validates literal dependency
symlinks and supplies only owned output overlays that cover no tracked files.
The first framework-v2 baseline replay failed because its linked-worktree Git
metadata was outside the namespace. An independent reconstruction from the
retained ancestor bundle fixed that precondition; both replays remain retained.
Full package/Yeet execution from the fresh reconstruction is still a separate
required proof, with no admission claim from the framework-only check.
## Native permission and child-tool closure require productive probes

The productive fixtures exposed behavior that version/startup checks missed.
Claude's noninteractive `dontAsk` profile needed explicit native write rules.
Grok required the documented Agent selector, a noninteractive permission mode,
and both background-task controls before a child could initialize. Allocated
child IDs were followed by initialization failures; they are not proof of child
inference. A one-spawn intervention stopped retries and retained partial state.
Native registry and inference-free child initialization now precede the next
bounded probe. Private evidence: `productive-grok-required-closure-offline-v1.json`
and the retained per-attempt native streams. Prevention: validate the complete
native dependency closure, then prove a real edit, compiler check and local
commit without relaxing the operating-system namespace.

## Offline canonical verification needs its native install and Git inputs

Fresh-source package audit/docgen passed, but canonical Yeet first required an
origin identity, writable standalone Git metadata for its temporary preflight
worktree, the lock-matching Bun install cache, and an unconditional main fetch.
An unrelated Bun cache lacked required packages; that failed install is retained.
The canonical cache then installed 2,574 packages offline. The next rehearsal
uses a read-only bare origin containing only the pinned base and its ancestors,
with native Git URL rewriting for the fetch. This supplies the same pinned base
without exposing credentials, network or host service sockets. All such evaluator
inputs must be bound in the contract digest, distinct from the coding checkout,
which has no remote. Private evidence: `runner-yeet-namespace-probe-*` receipts.
Full Yeet remains unproved until the actual command succeeds.

## Bind canonical proof to the actual native command

A synthetic collector fixture could finalize as passed when its shell reporter
matched a declared command contract. That is useful plumbing evidence but cannot
be admissible full-Yeet evidence. Collection and passing finalization now require
the exact native Bun/Beep/Yeet full-tier command, pinned base/head arguments,
namespace evidence and a single canonical verdict discovered from native stdout.
Legacy or synthetic receipts remain readable and retained, but missing native
bindings must fail admission. The regression test must cover this distinction;
a contract hash alone does not establish that its declared procedure is valid.

## Diagnose IDE modals visually before interpreting readiness

The dedicated JetBrains fixture reported an early ready state in one attempt,
then timed out in file synchronization. A later attempt never reported ready.
Thread dumps showed a modal event loop, while generic OCR returned only the
workspace label. Direct inspection of the retained screenshot established a
JetBrains Account sign-in modal. This does not determine the normal host IDE's
license validity or explain every readiness predicate. Preserve both the raw
observations and the correction; no login or speculative setup flag was used.
Private evidence: `serena-jb-dedicated-ide-attribution-supplement-v1.json`.
Prevention: inspect the actual modal and require a source-checked response after
index readiness; neither endpoint startup nor a transient status is sufficient.

## Retain a minimal Nix closure instead of trusting a live host store

The host baseline passed both canonical Nix commands, but a later isolated
development-shell probe offered 172 source builds with substitutes disabled.
Two Bash outputs had disappeared from the live store. Their signed public-cache
payloads total about 1.31 MB; importing them with seven closure metadata records
made both commands pass offline with builds disabled. An unsigned import fails
as intended. The host store remains a diagnostic input, not a frozen runtime:
capture only the required owned closure before admission, and preserve signature
verification and the no-build bound. Private evidence:
`runner-evaluator-nix-signed-cache-v3.log` and its retained probe receipt.

## Preserve container-store identity across evaluator namespaces

Native Podman rejected an owned store mounted under a different absolute path.
An archive conversion also changed image configuration serialization, so the
strict identity check rejected it. Mounting only the owned store at its original
path inside an otherwise empty namespace preserved native identity without
exposing parent host directories. An isolated extracted runtime then executed
the pinned scanner, which parsed the lockfile before its offline advisory request
timed out. Preserve that failure; next prove the existing exact-authority broker
and the actual command together. Do not mount the host Docker socket or treat a
container startup as a completed security scan. Private evidence:
`runner-evaluator-capability-probes-latest.json` and retained OCI probe receipts.

## Retention needs a restore proof before working-directory retirement

Candidate bundles already exclude the shared base history, but coding and
collector repositories each import that history, and both retain source archives.
For 117 cells, nominal baseline-sized packs, archives and tracked trees total
about 476 GiB before indexes, logs, caches or retries, against roughly 410 GiB
currently free and a 100 GiB reserve. This is scenario arithmetic, not allocated
storage measurement; reflink sharing must not be assumed. The current runner has
no archive/retirement command, and receipts bind artifact paths as well as bytes.
Do not remove a successful attempt casually. First prove exact restoration of
commit, tree, diff, raw evidence and shared-base dependencies in a fresh namespace,
including corrupted-input and missing-base rejection. Preserve failed attempts
and all original evidence while developing that canary. Private evidence:
`review-packaging/storage-audit-receipt.json` and `storage-measurements.json`.

## Match embedding inputs before asserting a vector self-match

Repowise's real integrated embedding fixture correctly ranked the expected source
first, but a self-match threshold failed because the query used only page body
text. Native indexing prepends title, path and summary. Using native `embed_item`
and `cap_embed_text`, and checking byte equality with the originally submitted
input, repaired the oracle with two local query-only calls. No prose generation
was repeated. Preserve the initial failure and distinguish semantic ranking from
identical-input vector checks. Private evidence: `ingestion-gap-summary-v1.json`.
The integrated run retains six model calls, six page/vector IDs, finite normalized
768-dimensional vectors, zero embedding-failure markers and successful reopen
queries. Separate mock-prose and real-embedding demonstrations were insufficient
to establish this integrated path.

## 2026-10-09 — Retention requires independent evidence and lifecycle review

The initial nine focused retention tests passed, but independent review found
that an output directory could overlap a source directory marked for later
retirement or an already hashed evidence directory. It also found incomplete
traversal of nested finalization proof references and an aborted classification
that the accepted terminal schemas could not represent. A separate Git fixture
showed that skip-worktree can hide changed tracked bytes from ordinary clean
status checks. The implementation remains uncommitted and is not admitted.

Prevention: test the complete failed and aborted lifecycle, require disjoint
output and retained dependency paths, traverse the full proof dependency closure,
and compare source bytes with committed objects independently of index flags.
Keep passing focused tests separate from independent review and package proof.
The private findings are in `retention-independent-review-v1.json`; no attempt
source or evidence has been deleted.

The Executor integration also stamped a drained-capture receipt after any spool
exit, including write failure or timeout. The process helper explicitly retains
partial files on interruption. Completion must follow observed successful drain;
a terminal process and hashable files alone cannot establish it. Failed files
remain evidence even when they cannot qualify source retirement. Private finding:
`review-packaging/parent-capture-completion-review-v1.json`.

## 2026-10-09 — Runtime declaration hashes need byte verification

Independent review of the evaluator runtime contract found that finalization
checked the four directory inventories but omitted standalone certificate,
bootstrap and broker artifact bytes. It also accepted absent or partial file
metadata. A digest of declared controls does not prove those inputs remained
unchanged. The runner worker is consolidating strict validation for Collector
and finalization; native proof remains unqualified until the checks and
negative regressions pass. Private findings are retained in
`runtime-security-independent-review-v1.json`.

Prevention: use the same complete byte and metadata validator when admitting
the runtime and when consuming its final proof. Preserve missing metadata as
an admission failure rather than silently skipping the check.

Native runtime admission then rejected an unlisted `bin/bwrap`: recursive
filesystem traversal followed a symlinked directory while the inventory described
links without following them. The worker changed validation to explicit no-follow
traversal. The failed startup remains retained; generated inventory files alone
do not prove admission or execution. A symlink-directory regression is required
so traversal and inventory semantics stay aligned.

## 2026-10-09 — Native dependency projections must cover real workspace roots

The first actual Collector attempt reconstructed source, then refused before
executing a check: "Runtime projection target is not a vendor dependency root".
Its allowlist omitted the frozen repository's `infra/node_modules` and
`infra/lambda/turbo-cache/node_modules` inputs. The source and failure receipt
remain retained. A narrow workspace-root correction and allow/deny regression
precede a fresh attempt; this startup is not a Yeet failure or pass.

Prevention: exercise the declared dependency projection against the actual
frozen workspace layout before the full command, preserving the checks against
masking tracked source and escaping the namespace.

## 2026-10-09 — Retention must preserve inventory projection semantics

The declared-seed custody fix passed its link-free fixture, but independent
review found that it validated every inventory at the default `/sealed` target.
The frozen Nix and OCI inventories have legitimate absolute links that their
native validators admit at `/nix` and `/runtime/oci`. Losing those targets
makes real runtime seeds fail retention despite successful native admission.
The correction preserves each declared target and keeps containment strict;
native-link positives and wrong-target/escape negatives are required. Private
evidence is in `retention-seed-independent-recheck-v1.json`.

The target-preservation fix also needed a shared helper from a worker that had
already handed back its task. A queued message does not restart an idle native
subagent. The orchestrator issued an explicit follow-up task; future dependent
handoffs should distinguish message delivery from an active implementation turn.

## 2026-10-09 — Cache relocation and writability need a native preflight

The native Collector spent 684 seconds validating dependency inputs before
rejecting the copied Bun cache. Its 4,845 package aliases still contained
absolute host-cache targets. The literals matched the frozen inventory, but
could not resolve in the evaluator namespace. The validator correctly refused
them; a copy receipt alone had not established namespace compatibility.

A fresh owned seed now uses relative aliases to identical package bytes already
present in that seed. Both read-only-cache install probes failed with
`EROFS accessing temporary directory`, including the explicit Bun temp setting.
An isolated writable copy passed the canonical frozen install, including the
repository lifecycle scripts. The common seed remained unchanged; private
cache output gained one temporary node-gyp file. Retain these failures alongside
`runner-native-link-attribution-v1.json`, the relocation/probe receipts and
`runner-native-bun-cache-integration-proposal-v1.json`.

Prevention: test the cache's native layout and write requirements before a long
Collector run. Bind a complete immutable seed inventory, independently verify
the private copy before the command, and retain small before/after inventory
artifacts. The filesystem copy API resolves relative links, so restore their
frozen literals before checking the initial copy. Measure peak allocation for
the 12,008,287,651-byte seed; do not assume reflinks or retain every mutable tree.

## 2026-10-09 — OCI clones must preserve image link literals

The portable filesystem copy API rewrites relative symlinks to absolute paths
under the original physical source. A read-only census found 2,789 relative
links in the frozen OCI store. A tiny source-bound fixture reproduced the musl
case: `lib/libc.musl-x86_64.so.1` points to `ld-musl-x86_64.so.1`; the original
link resolved in an isolated image view, but the copied link did not. Earlier
successful native OCI probes reused the original owned store and therefore did
not exercise this copy behavior. Evidence is in
`runner-oci-copy-link-probe-v3.json` and the retained diagnostic predecessors.

The fix shares the frozen-literal restoration loop already needed by Bun and
runs it on the fresh OCI copy before starting its service. It rejects seed/copy
overlap and noncanonical parents, preserves the common seed, and adds no mount
allowance. A focused regression checks that the copied musl alias resolves into
the copied root and that the original inventory remains unchanged. Prevention:
probe the actual clone primitive when moving a runtime into a new namespace;
container identity metadata alone does not prove filesystem link equivalence.

## 2026-10-09 — Structured tracked inventories must not use log bounds

Collector request four stopped after 1,173 seconds of preparation with
`Tracked root protection inventory is unavailable`. The exact sparse-namespace
Git command exited zero: its 33,160 NUL-separated paths occupied 3,302,037
characters, while diagnostic capture clipped output at 512 KiB. The truncation
guard correctly refused the partial inventory; the defect was using diagnostic
log capture for complete structured data. No native Yeet command ran.

The repaired boundary uses the existing spooled-stream abstraction with the
same `git ls-files -z` command. Zero exit and successful capture precede parsing;
NUL termination and canonical relative paths precede protection-root derivation.
Raw stdout/stderr are hashed proof dependencies and remain in retention closure.
A real index larger than the diagnostic bound proves its final root survives.
The repaired helper also captured all 33,160 paths and 96 roots from the retained
reconstruction without changing its index hash. Evidence is in
`runner-tracked-root-attribution-v1.json` and
`runner-tracked-root-repaired-probe-v1.json`.

Prevention: distinguish scalar diagnostics from complete inventory protocols.
Keep bounded logs bounded; use private spools for structured data that must be
complete. Adjacent full ignored/tree/flag inventories already spool, while
expected-empty or target-scoped checks still fail closed on truncation. No
log-bound increase, alternate Git inventory command or mount allowance is needed.

## Repeated system-inventory validation during native target guards

- Work: qualify the isolated native Collector on unchanged candidate `df7d88aad7`
  with runner `00b62a40a6`, after the complete tracked-inventory repair.
- Evidence: request five passed its exact-source framework check and retained all
  33,160 tracked paths. After 2,075.73 seconds it had no native Yeet verdict and
  was still preparing target guards. The agent stopped its owned scope with
  SIGINT; exit 130, source/request unchanged, clean checkout. This is an aborted
  attempt, not a passing rerun or a coding outcome.
- Attribution: 148 projected workspace roots and 1,461 writable targets each
  invoke two Git guards. Each guard revalidates the same 1,002-file, 260,945,384-byte
  sparse system inventory. The resulting 3,218 validations imply approximately
  839.7 GB of potential logical file reads, excluding other checks. This is
  source-derived amplification, not measured unique disk I/O, retained storage,
  tokens, or billing. Process observations showed continued CPU and cached reads,
  with no observed memory-limit or OOM event.
- Prevention under review: batch actual Git queries while retaining exact
  per-target tracked/ignored decisions, complete raw capture, canonical-path and
  mount guards, and system validation at each actual Git process boundary. No
  unchecked validation cache or relaxed passing rule is approved.
- Receipts: protected `native5-runtime-validation-performance-attribution-v1.json`
  and `runner-native-attempt5-interruption-v1.json`; all partial outputs, seeds,
  and local commits remain retained.

## Bind guard census to frozen controls, not only current artifacts

Independent review of the batching repair found that hashing the supplied
collection request and matching batch records proves internal consistency,
but does not freeze its projected-runtime target census. A changed request
could otherwise redefine the vendor coverage under unchanged attempt/check
digests. This is a pre-commit P1 finding; no native attempt used this repair.

The correction must bind the applicable projection/runtime census to the frozen
evaluator contract and validate decoded checks and Yeet equivalence. Add a
regression that mutates the census while keeping the other evidence consistent.
Preserve earlier requests as historical evidence; do not backfill their controls.
Prevention: distinguish artifact integrity from authorization by frozen inputs
when extending evidence protocols. The independent source review and final
closure receipt remain in protected staging.

## Validate the whole declared target census before expensive preparation

The real 1,461-target probe failed with `Mount guard target is unauthorized or
noncanonical`: 46 requested outputs belonged to exact infra, scratchpad and
compiler-shim roots, or root `dist`, absent from the original scalar allowlist.
Request five had stopped earlier in its serial preparation and had not reached
these targets. This is an inherited fixture/runtime mismatch exposed by the
batch preflight, not a new batch-path translation defect.

Frozen manifests establish the five exact package roots. Extend only their
existing output-leaf allowance after independent review; retain all Git and
filesystem guards. Future request preparation should validate every target
before expensive source reconstruction or cache copying. The failed probe and
manifest-bound attribution remain in protected staging.

## Exercise input-stream failure cleanup before native qualification

The third focused batching run stopped making test progress after adding an
early-closed stdin case; its worker sustained CPU without a completed test.
The owner interrupted that test command and retained exit 130 and its log.
A bounded process-only probe is attributing the failure. The separate real
1,461-target census passed in 4.179 seconds with unchanged Git index, but that
happy-path result does not prove stream-failure cleanup.

Require terminating producer-error, early-close and interruption checks before
source review closure or another Collector launch. Retain failures rather than
increasing test timeouts or dropping the case. This is unscored harness work.

The bounded process-only isolation subsequently passed all three tests in
1.95 seconds, including producer errors, early closure and interruption. This
refines the earlier attribution: stdin cleanup is not established as the cause
of the combined suite's stall. Runtime-only isolation exposed a test-fixture
ReferenceError; the owner corrected it. Proof-only isolation is pending to locate
the remaining combined-run stall before another full focused replay. A separate
`docgen:local` run failed on inherited infra Pulumi SDK type exports; retain that
classification and do not mix unrelated infra repairs into the runner wave.

A later read of the historical final retention log corrects the timing inference:
its 18 passing tests took 84.41 seconds. The new 30-second retention isolation
and 60-second combined bound were shorter than that established duration. Those
timeouts alone cannot establish a regression or a setup hang. Use a bound informed
by the retained passing receipt before further attribution. Evidence:
`retention-test-timing-attribution-v1.json`; original timeout logs stay retained.

## Run the hook-equivalent lint check before freezing source hashes

Normal local commit was rejected by Biome `useSingleVarDeclarator` in the new
guard's output-file declarations. The hook also sorted import blocks in three
files. The earlier formatting result did not establish hook-equivalent lint
compliance. No commit was created or hook skipped. Correct the declarations,
run the actual lint check and retain revised source hashes and focused receipts
before retrying the normal commit. Evidence: `target-batch-local-commit.log`.

## Avoid linear directory membership inside large inventory validation

Request six passed its framework, complete tracked-root capture and native vendor
guard on local `60f7dd1b5b`, but had not produced a native Yeet verdict. Read-only
source attribution confirmed `Array.contains` scans the 40,582-directory array
for every non-link inventory name. The frozen Bun seed has 407,235 files, 4,845
links and 40,582 directories: one complete validation therefore performs
17,349,880,423 string-equivalence comparisons at that branch. This is an
algorithmic count, not a measured fraction of elapsed time or a timing forecast.

The agent stopped its owned scope after 1,047.74 seconds; exit 130, clean source
and unchanged request. Preserve the attempt and partial evidence as aborted,
not a passing rerun. Replace only membership lookup with an existing Effect
hash set built once per validation. Keep name/duplicate validation, ordering,
file hashing, metadata, symlinks, traversal and final digest checks unchanged.
Receipts: `native6-directory-membership-attribution-v1.json` and
`runner-native-attempt6-interruption-v1.json`.

## Check dynamic addon dependencies before full runtime preparation

Request seven spent 1,597.69 seconds preparing and validating the native runtime,
then retaining failure evidence. Its CLI startup failed with
`librt.so.1: cannot open shared object file`; no Yeet verdict was produced. The
system generator had covered executable dependencies but omitted libraries
loaded by workspace native addons. All original evidence is retained.

Before another full attempt, inspect the selected native addon dependency
closure and probe the binding, wrapper and actual CLI inside the exact sparse
runtime. A separate one-file correction passes those probes; it does not prove
full Yeet. Preserve both runtime inventories and derive new check bindings.
Receipts: `native7-runtime-friction-v1.json`,
`native7-dynamic-node-elf-census-v1.json`, and
`sparse-librt-independent-closure-v1.json`.

Shared free disk also declined during the attempt. Its measured allocation was
18.6 GB, with possible shared-extent counting; larger filesystem changes are
not attributable solely to this run. Recheck live headroom before every heavy
launch and retain the 100 GiB reserve.

## Inventory command aliases and direct executables, not only ELF libraries

Request eight cleared Rolldown startup and reached native full Yeet, but direct
commitlint invocation failed with `Failed to spawn bunx`. The frozen PATH had
`bun` and lacked the distributed `bunx` alias. A source audit also identified a
direct external `test` command in Storybook artifact validation. Shell builtin
availability does not establish direct process-spawn availability.

Before another full preparation, enumerate the frozen lane commands and helper
requirements, classify their scope, and run bounded offline probes in the exact
namespace. Preserve the 1,440.25-second failed attempt and all inputs. Receipt:
`native8-runtime-friction-v1.json`.

## Prove mandatory sidecar toolchain discovery in the sealed runtime

Request nine reached native full Yeet and passed 22 pre-push lanes before
`quality:desktop-ipc` failed. The sidecar build calls `rustc -vV`, but the sealed
runtime did not contain that executable. Ten later lanes were not run. This is
an environment prerequisite failure, not a task implementation result.

The prior executable census did not fully traverse mandatory helper scripts.
Before another full Collector attempt, inspect the frozen sidecar build and IPC
lane, bind its required toolchain and outputs, and run a bounded probe inside
the same namespace. Retain this failed attempt and the original runtime; do not
weaken or skip the desktop lane. Receipt: `native9-runtime-friction-v1.json`.

The runner's exact clean commit `376943bfad` separately passes default
`bun run beep quality package-verify @beep/repo-cli`: audit 917.5 seconds,
docgen 23.7 seconds, exit zero. This proves the runner package and does not
substitute for the candidate's native full Yeet result.

## Require an executed validator result, not merely a zero exit

The external Rust inventory validation invocation printed Bun help and exited
zero without running its TypeScript script. The first probe caught the same
routing problem because its required reconstruction output was absent. The
claimed validation pass was withdrawn; original preparation and review receipts
remain unchanged. Static file identities and ELF dependency inspection are
separate evidence and remain valid.

The corrected invocation produces both an execution marker and a successful
public-validator result. The actual compiler probe then passes in the offline
namespace. Future smoke checks must verify their required semantic output and
artifact, not only process exit. Receipts:
`native-desktop-rust-public-validation-correction-v1.json` and
`native-desktop-rust-probe-v2.json`.

## Validate mandatory generated outputs before a full run

Frozen desktop build source writes its Bun sidecar under the specifically
ignored `apps/professional-desktop/src-tauri/binaries` directory. The current
public writable-target guard rejects that path as unauthorized or noncanonical;
the exact rejection is retained. No permissive overlay or IPC execution bypassed
the guard. Admit only this source-proven exact output root, retaining tracked,
ignored, canonical and symlink checks, with neighboring-path rejection tests.
Then rerun the failed guard and previously unexecuted IPC lane before full Yeet.

A source audit of remaining gates also found the mandatory full lint-policy
`typos` executable absent from the declared runtime. Its preparation must use a
fresh inventoried copy. Conditional browser assets remain unqualified; a skipped
branch provides no readiness evidence. Receipt: `native-desktop-rust-probe-v2.json`.


## Account for the full cache in probe admission

A draft offline-probe plan allowed only 8 GiB of temporary space although the
immutable Bun seed contains about 12 GB of logical file data and an earlier
native allocation measured 18.6 GB. The estimate lacked evidence and was
corrected before execution. Preserve the old plan; admit with a conservative
64 GiB temporary allowance plus the 100 GiB reserve, and retain a watchdog that
stops only the owned scope. The actual probe completed without interruption.
Its guard/cache preparation took 410.04 seconds, separately from the 6-second
desktop IPC command. Most memory at the 24 GiB cap was file cache; the observed
cgroup counters showed no OOM kill. Receipts: `native-desktop-v3-probe-plan-v3.json`,
`native-desktop-v3-resource-observations.jsonl` and
`native-desktop-v3-parent-verification-v1.json`.


## Preserve bootstrap binaries as well as the sandbox runtime

The October 13 post-reboot check found that the request still referenced mutable
host bootstrap files. Of 32 artifact references, five checks failed across four
unique files: Python appeared twice, Python's shared library and Podman changed,
and the pinned SQLite filename disappeared. The standalone broker/bootstrap
inputs therefore cannot reuse their earlier pass without recovery.

The frozen sparse runtime and tool entrypoints are separate from these host
references. Recover exact original bytes into owned storage when available,
regenerate path-bound contracts, and prove the bootstrap before another long
Collector run. Do not roll back workstation packages, substitute updated bytes,
or rewrite the historical attempt. Receipt:
`attempt11-reboot-standalone-artifact-check-v1.json`.

## Declare the outer bootstrap boundary before freezing trial controls

Exact old binaries were recoverable after the update, but the host loader could
still search undeclared libraries. An audit-library probe rejected an outside
load before its constructor, while a missing audit module and a child that
removed the audit setting both permitted ordinary execution. These negative
results disqualify environment-only audit as the boundary guarantee; they do
not establish that the pinned Podman actually performs either bypass.

The UID/GID mapping helpers also obtain privilege through file capability
xattrs, which the existing hash, mode and ownership contract does not bind.
Distinguish frozen inner runtimes from host bootstrap dependencies explicitly,
include the actual privilege metadata, and qualify each revision before a long
run. The dated decision selects a reviewed bootstrap-only revision before any
scored cells, preserving the frozen catalog and old requests. Receipt:
`attempt11-bootstrap-offline-feasibility-closure-v1.json`.

## Enforce read-only storage during interpreter recovery probes

The fresh request-eleven strict preflight rejected six unlisted entries in the
preserved system: four Python bytecode files and two cache directories. A private
old-loader probe had used the owned Python library tree without disabling
bytecode writes. The later bwrap probes mounted that tree read-only. No declared
input was missing, and the full Collector had not started.

Preserve the exact additions in a forensic backup and restore their original
absence only after confirming that the two new directories contain no declared
inputs or unrelated files. Recheck every declared input and require zero extras;
do not amend the frozen inventory to accept probe artifacts. Future Python probes
must disable bytecode generation and use read-only filesystem mounts wherever
possible. Receipt: `attempt11-strict-system-unlisted-attribution-v1.json`.


## Qualify account lookup and failed-verdict retention before long native checks

The October 13 eleventh synthetic Collector attempt passed 24 full pre-push
lanes, including desktop IPC and the JSDoc ratchet. Nine CLI doctests then failed
with `uv_os_get_passwd returned ENOENT`; eight later lanes did not run. The sealed
system had no account files, while module initialization calls Node's
`os.userInfo().homedir`. A HOME setting alone does not supply that lookup.

Prepare synthetic account records as explicit read-only system inputs, matching
the observed namespace UID/GID and declared writable home. Prove positive,
missing-user and wrong-home cases with the pinned Node runtime before rerunning
the affected doctests. Preserve existing system snapshots and use fresh inputs;
do not bind host account files or modify candidate source to bypass the failure.

After the failed command, Collector separately refused the native verdict
location. The native stderr records a missing `flock` executable, and stdout
contains no verdict announcement. Attribute and test that finalization path
independently: a failed quality command must retain an honest failed verdict,
and successful account lookup alone cannot establish that retention. The attempt exited 1 after 3,430.84 seconds; its scope
settled, runtime preservation passed, and source, request and helper capability
checks remained unchanged. No passing native proof or Executor custody resulted.
Receipts: `native-attempt11-terminal-summary-v1.json`,
`native-attempt11-terminal-addendum-v1.json`,
`native-attempt11-finalization-error-v1.json`, and
`attempt11-passwd-namespace-attribution-v2.json`.


## Distinguish admission cancellation from successful bootstrap

The exact older-baseline qualification queued for 915.9 seconds while all five
existing heavy slots were occupied. Its owned queued service was stopped at the
preregistered 15-minute fence; the manager then reported it inactive with no
remaining process or cgroup. The detached candidate stayed clean, and install,
SDK preparation and coverage never started.

The outer launcher returned zero when the queued service was stopped. A completed
bootstrap marker and actual stage receipts must therefore gate success; process
exit alone is insufficient. Preserve the held candidate and wait for changed
capacity evidence before resubmitting. Do not modify shared slot limits or stop
foreign work. Receipt: `ancestor-baseline-candidates-20261013/bootstrap-actual-v1/terminal-cleanup.json`.


## Measure guard preparation separately from command execution

Attempt eleven ran for 3,430.84 seconds. The full native check began about 32
minutes after launch, after source and runtime preparation; its observed first
red arrived about 19 minutes later. The remaining interval included capture and
post-run guards. Report these phases separately from agent coding time, and
retain their resource observations. Do not call a tool fast or slow by charging
all preparation to one model session or by omitting this harness overhead.

Use bounded source-supported prerequisite probes before repeating a full native
attempt. Any later optimization of repeated inventory reads must preserve exact
census, byte/metadata bindings, and pre/post validation; cached success alone
cannot stand in for immutable input proof. Receipt:
`native-attempt11-terminal-summary-v1.json` and its retained full-check logs.


## Attribute inherited lock descriptors before diagnosing stale admission

A follow-up capacity attribution found live processes holding matching descriptors
for every locked slot. The acquisition PIDs had exited, while inherited
open-file descriptions still held the locks. Do not infer stale admission from
an absent acquisition PID alone: correlate kernel lock device/inode records with
accessible process descriptors and cgroups. No foreign process was changed.
Receipt: `ancestor-baseline-candidates-20261013/descriptor-attribution-20261013T210304Z.json`.


## Include real retention fixtures in isolation-contract regression checks

The first default package verification after the account-file boundary change
passed build and type checking, then reported 5,867 passing tests and one failure
in the real sealed-Git candidate-retention case. The failure was the exact
three-file account census guard. The 28 narrower boundary and proof tests had
passed, so they did not cover this existing consumer of the shared binding path.

Source review attributed this to the existing strict fixture: it requested a
productive sealed system with a Git-only inventory. Add owned synthetic account
files, prove the incomplete inventory is rejected without published output, and
recapture the complete inventory before the existing real retention roundtrip.
Include that case in focused verification, then rerun the full package audit and
documentation gate. Keep the native account boundary unchanged. The failed package run took 1,370.19 seconds; retain
that cost and its failure instead of relabeling the earlier focused pass.
Receipt: `code-graph-package-aac30f2-1791927383193654817.terminal.json`.
