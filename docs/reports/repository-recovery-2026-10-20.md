# Repository recovery issue inventory

PR: [#1928](https://github.com/beep-effect/beep-effect/pull/1928).
Branch: `fix/slop-10-14-26`. Snapshot: 2026-10-20, 61 open issues.

Each issue stays open until its acceptance criteria have source, test, or live
qualification evidence. Green quality checks do not substitute for historical
completion, native runtime, owner-verified cleanup, or signing evidence. Rows distinguish completed acceptance evidence from outstanding work; GitHub
closure remains conditional on this PR merging.

## Quality gates

- `turbo test`: passed 159 tasks before the latest coverage-policy changes.
- `bun run test`: final-head verification pending.
- Coverage: all five labs enrolled; generated package scripts and measured rows
  preserve existing floors and minimums. Coverage-policy tests: 267 passed.
- Full coverage: pending; discovery found a Node-incompatible YAML test and a
  missing temporary V8 report. Clean verification remains required.
- Docgen: repository-wide generation passed all 145 tasks at `5683e4fd3b`,
  including the 2,685 scratchpad examples. Subsequent changes remain subject to CI.
- Audit: filesystem test pipe diagnostic repaired; full verification pending.
- Hosted checks and legitimate review findings: tracked on the PR.

## Published and pending repair waves

- `4c27e8b762`: tests, enforced lab coverage, and gateway documentation fixes.
- `37ec9d8fdb`: security overrides for MCP client 2.3.1, follow-redirects 1.16.1,
  http-cache-semantics 4.3.0, and launch-editor 2.14.2. Fresh Bun audit reports
  only the existing exact braces and sprintf-js exceptions; hosted rerun pending.
- Cache policy: canonical recorder reviewed 31 drifted tasks and 19 source
  configurations, preserved qualification scope/profile/epoch, and reports zero
  blocking findings.
- Fallow audit: unused ESLint removed, shared browser configuration consolidated,
  generator branching simplified, and repeated cache host checks consolidated.
  The affected audit reports zero introduced findings.
- Scratchpad memory-filesystem contracts: 649 tests passed, 21 existing skipped,
  using the canonical tmpfs test environment. The larger selected run passed
  5,706 tests with only the known filesystem-environment case failing; the
  canonical memfs rerun covers that case.
- The next wave repairs the disabled Collapsible browser test (six stories pass),
  expresses Trustgraph startup with Effect (full lab audit passes), and pins Fallow
  to the main-compatible 3.33.1 analysis while preserving the zero-findings gate.
  See [the migration hold](fallow-compatibility-hold-2026-10-20.md).
- Review-hub configuration validation now covers normalized logins, empty required
  inputs, and an invalid port. Coverage measurement and its baseline row are pending.
- The latest local full coverage run reached all ten shards; the repo-cli shard
  failed nine assertions retaining the retired labs coverage exclusions. The three
  affected suites now pass all 40 tests. The full audit also loaded changing source
  and tests, so neither run is final-head proof.
- AI-metrics snapshot publication and Git-boundary fault tests restore
  `config-snapshot.ts` to 96.81% lines, 97.04% statements, 91.07% functions, and
  100% branches; transcript-role tests restore `hook-pulse.ts` branches to 100%.
  The package audit and docgen pass. Hosted measurement and raised baseline rows
  remain required.

## Hosted lint-policy repair

The hosted run at `78005fb683` passed build, check, docgen, doctest, integration,
unit tests, labs, Storybook, security, and ordinary lint. Heavy lint policy failed
on Effect test findings, stale schema advisory locations, and two stale detector
source ranges. Remaining jobs were still running at that observation.

The repair keeps the Effect test inventory unchanged. Native filesystem
provenance now follows the instrumented layer harness; fixed-layer toolkit
helpers retain resource-definition review without misclassifying their data
arguments as supplied layers. Direct `vi` imports are permitted only when required
by hoisted module mocks; registration imports remain under the Effect harness.
Negative detector fixtures retain mixed imports, shadowing, and actual supplied
resource layers. The retry regression owns its clock, the Turbo hash regression
uses the public scoped layer harness, and Option comparisons use canonical
assertions. Three focused suites pass all 228 tests; the test compiler and quick
package verification for CLI, AI metrics, and Trustgraph pass.

Three existing schema advisory locations and two fixed detector source ranges
are refreshed without adding exceptions or changing the reference classifier.
The committed-tree reference check now reports zero live gated observations.
Full policy verification and hosted confirmation remain pending.

The same hosted head also failed Effect Diagnostics at 16 collection call sites
(17 project diagnostics, including one shared source visited twice). The repair
uses Effect Array/Record helpers in the gateway, setup app, law-practice tests,
MCP bundle test, and schema parity test. All five additional affected packages
pass quick lint/type verification. Focused standalone diagnostics are running;
this does not claim the hosted rerun has passed.

## Built export proof for #1607

The T3 package and generic package generator now map the published root to
the JavaScript entry point in the packed `dist` directory. Source exports,
internal export denial, private status, and generated task scripts are preserved. All 21 generator regressions pass, and
T3 package audit and docgen pass.

For the package fixture, Bun packed the built package and resolved workspace and
catalog versions. Its pack command preserves source exports and retains the
publication override. The extracted archive was then packed with pnpm, which
applies `publishConfig.exports`. That archive was installed by extraction into
an isolated fixture under `.beep/`. Node resolved both the root and
`T3Code.models` subpath to existing JavaScript, imported both successfully, and
rejected the internal subpath. No package was published. Bun's workspace-aware
resolver selects the source workspace when run inside this clone, so Node was
used for the external package-resolution proof.

## Native session lifecycle proof for #1586

Claude now records transport termination before failing active work or admitting
another prompt. Cleanup has its own idempotence guard, so a prior EOF cannot
suppress process cleanup; killing an already exited owned child is harmless.
The write guard and pending-receipt cleanup also cover a transport ending between
the initial admission check and queue submission. No failed turn is replayed.

Synthetic child fixtures prove successful completion followed by idle EOF,
active EOF with a queued second prompt, one received prompt, and one closed event
after repeated close. Codex/Grok can return the denial phrase twice successfully;
a quoted Cursor response also preserves session health. The existing captured
Cursor denial still fails as access-blocked despite end_turn. The remaining
heuristic is explicit: Cursor text beginning with the bare denial phrase is
classified as denial, because its terminal marker does not distinguish an actual
subscription rejection from an otherwise identical model answer.

The package audit passes all 63 Bun tests, build, type checks, and lint; docgen
passes. Three new regressions also pass under Node. Standalone diagnostics pass
both driver projects, and the Effect test ratchet adds zero findings. One existing
fixture advisory location is refreshed; its reviewed reason is preserved.

## Probe and path proof for #1587

The retained explicit-policy mitigation script requires `--run-model-probes`
before workspace mutation or provider setup. Umask 077 precedes creation, and
existing workspaces must be owned, empty, real directories with mode 0700.
Existing socket paths and nonprivate probe directories are refused. Seven
standalone Python guard tests pass with a synthetic child HOME and no provider
executables or configuration. Reproduction documents the opt-in and a separate
`--prepare-only` zero-model path; policy assertions, deadlines, owned-thread
isolation, cleanup, and historical receipts are unchanged.

The prospective lifecycle decision is back inside its original Decision Log
table. The installed Marked GFM parser confirms the rendered table contains both
the initial decision and the prospective row, including its before-merge condition.

The already published `fileURLToPath` corrections were qualified using unchanged
copies of both process-backed suites and their child fixtures under the physical
`.beep/encoded fixture café/` path in this clone. Both suites pass all 45 tests
under Node and all 45 under Bun, including real SQLite contention, READY
synchronization, deadlines, and child cleanup. No second clone was created.

## Fallow follow-up

Hosted head `03158fb833` exposed one introduced cognitive-complexity finding in
the detector's main loop. `f4c71ac1c7` filters the declarations before the loop,
preserving the predicate while reducing nesting. All 218 detector regressions
and CLI quick lint/type verification pass; the Fallow audit reports zero
introduced findings. No baseline or threshold changed. Full lint policy also
completed successfully during this repair wave; current-head hosted checks
remain authoritative.

## Open issue acceptance tracking

| Issue | Requested outcome | Status |
| --- | --- | --- |
| [#1576](https://github.com/beep-effect/beep-effect/issues/1576) | fix(agent-message): retain terminal receipts after mid-turn acknowledgment | Terminal history/detail retained for active and ambiguous acknowledged dispatches; ACK identity, stale-claim rejection, and queue serialization covered |
| [#1578](https://github.com/beep-effect/beep-effect/issues/1578) | fix(ai-provider-cli): allowlist managed launch environments per provider | HOME/PATH allowlists plus owned CODEX_HOME for Codex; 71 rejected key/provider cases prove no spawn or profile creation; fixture switches use test argv; 46 session and nine runtime tests pass; package audit/docgen and standalone diagnostics pass |
| [#1579](https://github.com/beep-effect/beep-effect/issues/1579) | feat(agent-message): qualify ambiguity reconciliation and capacity fairness | Partial: adapter/session/outcome attestations fenced and 55 store/models/command tests pass; independently verified original native terminal correlation and total history storage bound remain open |
| [#1581](https://github.com/beep-effect/beep-effect/issues/1581) | fix(agent-comms): qualify historical probe and snapshot evidence | Six zero-model actual-function regressions pass for preserved Claude event batches and exact bounded Grok ACK echoes; historical receipts preserved; publication/lifecycle statements dated, reflection links and readability repaired |
| [#1582](https://github.com/beep-effect/beep-effect/issues/1582) | fix(goals): distinguish proposed closeout from operative completion | Acceptance review pending |
| [#1586](https://github.com/beep-effect/beep-effect/issues/1586) | Fence ended native sessions and scope Cursor denial classification | Claude transport termination fences future/queued prompts; cleanup is independent and idempotent; Cursor-only denial classification preserves quoted output; 63 package tests, audit, and docgen pass |
| [#1587](https://github.com/beep-effect/beep-effect/issues/1587) | Tighten agent-messaging probe opt-in and test portability | Seven zero-model admission/permission tests pass; lifecycle row renders in its decision table; both process-backed suites pass 45 tests under Node and Bun from a physical space/Unicode path |
| [#1603](https://github.com/beep-effect/beep-effect/issues/1603) | fix(agent-message): reconcile completion after attached lease expiry | Only expired terminal completion defers to recovery; live-clock regression proves one submission, surviving worker, and ambiguity fence |
| [#1607](https://github.com/beep-effect/beep-effect/issues/1607) | fix(t3-code): qualify built root export before publication | Published root and canonical generator use dist/index.js; 21 generator tests, package audit/docgen, and packed Node root/subpath import proof pass; package remains private |
| [#1613](https://github.com/beep-effect/beep-effect/issues/1613) | fix(agent-message): scope prior envelope reuse to the sending grant | Cross-sender ID rejected before metadata reuse; real-store boundary tests cover idempotence, changed content, unchanged inbox and receipt count |
| [#1702](https://github.com/beep-effect/beep-effect/issues/1702) | knowledge doctor: lexer-aware block-comment blanking and v2 lock decode errors (#1690 follow-ups) | Implemented on main in ec580c30a2; 14 evaluator regressions passed |
| [#1708](https://github.com/beep-effect/beep-effect/issues/1708) | effect-vitest: EV010 flags every platform-node import, including canonical it.layer setups | Acceptance review pending |
| [#1740](https://github.com/beep-effect/beep-effect/issues/1740) | Nightly property-law sweep failures | Acceptance review pending |
| [#1742](https://github.com/beep-effect/beep-effect/issues/1742) | docs(skills): align replay comment example with GraphQL bot login | Already implemented in 5169ea9584; replay regressions passed |
| [#1772](https://github.com/beep-effect/beep-effect/issues/1772) | Handle invalid receiving grant when receipt write exhausts lock retries | Pinned invalidGrant survives nine failed completion writes; unsaved receipt logged, claim retained, dispatch loop exits without resubmission |
| [#1789](https://github.com/beep-effect/beep-effect/issues/1789) | fix(reviewer): preserve terminal checks and stop empty pagination | Active-only cancellation and empty-page termination fixed; 84 reviewer/bootstrap/merge-gate tests passed |
| [#1835](https://github.com/beep-effect/beep-effect/issues/1835) | fix(observability): name schema-first scan spans by domain | Span names fixed; catalog conforming; focused tests passed |
| [#1848](https://github.com/beep-effect/beep-effect/issues/1848) | drawings critics test: measure the late-limit seat start from the sequence's own start | Sequence-relative clock assertion fixed; critic tests passed |
| [#1851](https://github.com/beep-effect/beep-effect/issues/1851) | rsc follow-up: finish the later repository retirement waves | Acceptance review pending |
| [#1852](https://github.com/beep-effect/beep-effect/issues/1852) | rsc follow-up: qualify retained repository tool workflows | Acceptance review pending |
| [#1853](https://github.com/beep-effect/beep-effect/issues/1853) | rsc follow-up: complete all retained patch regression and exit proofs | Acceptance review pending |
| [#1854](https://github.com/beep-effect/beep-effect/issues/1854) | rsc follow-up: resolve foreign-clone residue with live owners | Acceptance review pending |
| [#1855](https://github.com/beep-effect/beep-effect/issues/1855) | rsc follow-up: finish detector repairs and individual exception review | Acceptance review pending |
| [#1856](https://github.com/beep-effect/beep-effect/issues/1856) | rsc follow-up: finish guidance currency and artifact classification | Acceptance review pending |
| [#1857](https://github.com/beep-effect/beep-effect/issues/1857) | rsc follow-up: resolve GitHub Packages external-contract uncertainty | Acceptance review pending |
| [#1858](https://github.com/beep-effect/beep-effect/issues/1858) | rsc follow-up: finish remaining hosted workflow acceptance probes | Acceptance review pending |
| [#1859](https://github.com/beep-effect/beep-effect/issues/1859) | rsc follow-up: qualify protected desktop release signing | Acceptance review pending |
| [#1860](https://github.com/beep-effect/beep-effect/issues/1860) | rsc follow-up: finish catalog removals and unused-entry detection | Acceptance review pending |
| [#1861](https://github.com/beep-effect/beep-effect/issues/1861) | rsc follow-up: finish hold register and compatibility exit proofs | Acceptance review pending |
| [#1862](https://github.com/beep-effect/beep-effect/issues/1862) | rsc follow-up: qualify retained native and shared agent workflows | Acceptance review pending |
| [#1863](https://github.com/beep-effect/beep-effect/issues/1863) | rsc follow-up: collect matched final agent-context workflow measurements | Acceptance review pending |
| [#1864](https://github.com/beep-effect/beep-effect/issues/1864) | rsc follow-up: qualify ordinary native hook startup and ancestry | Acceptance review pending |
| [#1865](https://github.com/beep-effect/beep-effect/issues/1865) | rsc follow-up: qualify a dated telemetry namespace cutover | Acceptance review pending |
| [#1866](https://github.com/beep-effect/beep-effect/issues/1866) | rsc follow-up: qualify desktop and native Codex OTel ingress | Acceptance review pending |
| [#1867](https://github.com/beep-effect/beep-effect/issues/1867) | rsc follow-up: qualify the approved telemetry archive reference | Acceptance review pending |
| [#1868](https://github.com/beep-effect/beep-effect/issues/1868) | rsc follow-up: complete current-fingerprint 30-session qualification windows | Acceptance review pending |
| [#1869](https://github.com/beep-effect/beep-effect/issues/1869) | rsc follow-up: separate telemetry storage completeness from stamp qualification | Acceptance review pending |
| [#1870](https://github.com/beep-effect/beep-effect/issues/1870) | rsc follow-up: run the operator Desktop permission fixture batch | Acceptance review pending |
| [#1871](https://github.com/beep-effect/beep-effect/issues/1871) | rsc follow-up: apply owner-verified recoverable storage retention | Acceptance review pending |
| [#1872](https://github.com/beep-effect/beep-effect/issues/1872) | rsc follow-up: prove cold remote cache reads with an approved read-only reference | Acceptance review pending |
| [#1873](https://github.com/beep-effect/beep-effect/issues/1873) | rsc follow-up: qualify cache posture across native harnesses and legacy roots | Acceptance review pending |
| [#1874](https://github.com/beep-effect/beep-effect/issues/1874) | rsc follow-up: qualify generated-build incremental output restoration | Acceptance review pending |
| [#1875](https://github.com/beep-effect/beep-effect/issues/1875) | rsc follow-up: finish the reconciled Effect Vitest canon cohorts | Acceptance review pending |
| [#1876](https://github.com/beep-effect/beep-effect/issues/1876) | rsc follow-up: qualify and publish preserved RDF and Pacer follow-up ports | Acceptance review pending |
| [#1877](https://github.com/beep-effect/beep-effect/issues/1877) | rsc follow-up: retire reconciled Vitest lanes and program lanes safely | Acceptance review pending |
| [#1878](https://github.com/beep-effect/beep-effect/issues/1878) | rsc follow-up: supply complete historical completion evidence | Acceptance review pending |
| [#1879](https://github.com/beep-effect/beep-effect/issues/1879) | rsc follow-up: scope atomic-exchange capability to target filesystems | Acceptance review pending |
| [#1880](https://github.com/beep-effect/beep-effect/issues/1880) | rsc follow-up: add restart recovery states to native exchange journals | Acceptance review pending |
| [#1881](https://github.com/beep-effect/beep-effect/issues/1881) | rsc follow-up: qualify atomic skill publication and replacing-writer recovery | Acceptance review pending |
| [#1882](https://github.com/beep-effect/beep-effect/issues/1882) | rsc follow-up: qualify dependency-review fixture-path filtering | Acceptance review pending |
| [#1883](https://github.com/beep-effect/beep-effect/issues/1883) | rsc follow-up: resolve post-merge completion and lane retirement evidence | Acceptance review pending |
| [#1889](https://github.com/beep-effect/beep-effect/issues/1889) | coverage follow-up: @beep/practice-review-hub sits below the repository tier minimum | Hosted coverage at 03158fb833 matches the generated @beep/practice-review-hub baseline row; all repository floors met; no existing rows or floors changed |
| [#1890](https://github.com/beep-effect/beep-effect/issues/1890) | coverage follow-up: record a baseline row for @beep/palantiri | Hosted coverage at 03158fb833 matches the generated @beep/palantiri baseline row; all repository floors met; no existing rows or floors changed |
| [#1891](https://github.com/beep-effect/beep-effect/issues/1891) | coverage follow-up: record a baseline row for @beep/practice-claude-mod | Hosted coverage at 03158fb833 matches the generated @beep/practice-claude-mod baseline row; all repository floors met; no existing rows or floors changed |
| [#1892](https://github.com/beep-effect/beep-effect/issues/1892) | coverage follow-up: record a baseline row for @beep/t3-code | Hosted coverage at 03158fb833 matches the generated @beep/t3-code baseline row; all repository floors met; no existing rows or floors changed |
| [#1893](https://github.com/beep-effect/beep-effect/issues/1893) | coverage follow-up: strict-tier drops in practice-kg-mcp, law-practice-server and repo-cli (observability-palantiri lane) | Acceptance review pending |
| [#1894](https://github.com/beep-effect/beep-effect/issues/1894) | coverage follow-up: drawing review loop drops in occt, technical-drawing and repo-cli Drawings (drawings lane) | Acceptance review pending |
| [#1895](https://github.com/beep-effect/beep-effect/issues/1895) | coverage follow-up: ai-metrics config-snapshot drops after the git-metadata fix (#1830) | Acceptance review pending |
| [#1910](https://github.com/beep-effect/beep-effect/issues/1910) | rsc follow-up: #1909 round-3 guidance review findings (#1856) | Four documentation corrections; installed declarations, skills metadata, and goal doctor checked |
| [#1916](https://github.com/beep-effect/beep-effect/issues/1916) | squash-commitlint follow-ups from #1915 round 3: header URL exemption, yeet SKILL.md length | Header URL diagnostic fixed; regression passed; skill is 495 lines |
| [#1920](https://github.com/beep-effect/beep-effect/issues/1920) | rsc follow-up: persist verified completion receipts before the rule-suite window closes (~2026-11-05) | Acceptance review pending |

Closing references will be added only after the matching acceptance evidence is recorded.

## Review wave 1 evidence

- Runtime patch keys refreshed from pristine releases; see
  [runtime patch refresh](runtime-patch-refresh-2026-10-20.md).
- Font lookup now falls back per name field across platform tables, including
  empty translation tables. Fifty font/render regressions passed; the full
  technical-drawing package audit and docgen passed.
- Lab standard and lifecycle D15 now describe root quality and coverage
  enrollment while retaining the separate hosted product partition.
- Todox production build passed after including the shared root configuration
  in the fourteen existing explicit TypeScript project file lists.
- Four real-Turbo hash tests passed, including invalidation when vite.shared.ts
  changes. The cache recorder adopted the audited input-set change without
  altering qualification scope, profile, epoch, or qualification states.

## Provider environment admission proof for #1578

Managed native launches admit HOME and PATH for all four providers and CODEX_HOME
only for Codex, where its existing owned-directory check remains mandatory. Both
spawn paths retain isolated environments. Credentials, endpoint overrides, loader
switches, locale/temp/runtime overrides and synthetic fixture environment keys
are rejected before profile preparation or spawning. Fixture behavior now travels
through test-only child arguments.

A table covers 71 rejected key/provider combinations, verifies zero spawns and no
profile-directory creation, and checks that failure text does not disclose the
synthetic value. Healthy two-turn sessions cover all four providers. The 46
provider session tests and nine CLI runtime tests pass under Node; the provider
package audit and docgen pass, as do standalone Effect diagnostics. The repo-wide
Effect test-policy ratchet reports zero introduced findings.

The hosted run at 03158fb833 reports one contract-fixture failure in unit,
property and coverage jobs. The supplied-layer correction and explicit layer
hook timeout pass 254 focused contract/detector tests locally. Its separate
knowledge semantic-delta failure came from this report spelling an illustrative
packed entry point as a tracked relative path; the prose now names the artifact
without a false source link. These corrections still require hosted confirmation.

## Hosted baseline qualification for #1889–#1892

The coverage job in [run 39495252453](https://github.com/beep-effect/beep-effect/actions/runs/39495252453)
completed the four package measurements before the unrelated CLI contract test
stopped the overall lane. Each total matches the scoped baseline writer exactly:

| Package | Lines | Statements | Branches | Functions |
| --- | ---: | ---: | ---: | ---: |
| Practice Review Hub | 72.97 | 71.79 | 100 | 69.23 |
| Palantiri | 97.81 | 97.77 | 95 | 95.63 |
| Practice Claude Mod | 82.70 | 82.92 | 68.85 | 83.62 |
| T3 Code | 96.46 | 87.87 | 83.92 | 71.05 |

The baseline change adds only these four package rows. All existing package
rows, the 70/70/50/60 floors and epsilon remain unchanged. This qualifies the
four baseline issues; the repo-wide coverage lane still needs a passing rerun.
