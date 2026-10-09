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
