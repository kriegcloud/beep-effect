# Repo Architecture Convergence Specification

## Status

**PENDING**

## Owner

@beep-team

## Created / Updated

- **Created:** 2026-04-23
- **Updated:** 2026-04-23

## Mission

This initiative exists to make the checked-in `beep-effect` workspace conform
to the binding repo constitution in
[`standards/ARCHITECTURE.md`](../../standards/ARCHITECTURE.md) and to the
repo-law surfaces that govern implementation quality and execution hygiene.
The unit of progress is executed repo change plus proof, not packet
completion.

## Non-Negotiable Contract

- A phase may be marked `completed` only when the repo changes for that phase
  are present, all required command gates pass, required search audits are
  attached, required ledgers are updated, and blockers are resolved or
  explicitly escalated.
- Documentation may describe work, but it is never sufficient evidence on its
  own.
- Every migration batch must identify its consumers/importers, compatibility
  plan, command gate set, and deletion plan before execution starts.
- The authoritative live governance plane for compatibility and amendment
  control is `ops/`. Design notes and history outputs may discuss those
  ledgers, but only `ops/compatibility-ledger.md` and
  `ops/architecture-amendment-register.md` count as current closeout state.
- Temporary aliases, shims, allowlist entries, and route exceptions are
  allowed only when they are governed in the compatibility ledger or
  `standards/effect-laws.allowlist.jsonc` with owner, reason, issue, created
  phase, expiry or deletion phase, and proof plan.
- A permanent deviation from `standards/ARCHITECTURE.md` is not a "known
  issue". It is an architecture-amendment candidate and must be tracked in the
  architecture-amendment register until resolved.
- Final closure requires 100% architecture-matrix compliance and 100%
  repo-law-matrix compliance. `Deferred`, `temporary`, `known follow-up`, and
  `close enough` are not valid end states.

## Scope

### In Scope

- actual package moves, import rewrites, export cutovers, and compatibility
  deletions required to converge the live repo on
  `standards/ARCHITECTURE.md`
- repo-wide enablement and wiring work that otherwise regenerates the legacy
  topology, including workspace globs, aliases, scripts, scaffolders, docgen,
  repo checks, config sync, tooling emitters, and hard-coded entrypoints
- app entrypoint and Layer-composition changes needed to stop top-level
  assembly from preserving pre-standard shapes
- routing, extraction, and validation work for `shared/*`, `foundation`,
  `drivers`, `tooling`, `agents`, `repo-memory`, and `editor`
- temporary exception governance through the compatibility ledger,
  architecture-amendment register, and `standards/effect-laws.allowlist.jsonc`
- phase evidence packs, compliance matrices, and final verification proof

### Out Of Scope

- silently accepting permanent dual-topology aliases
- treating markdown completion as initiative completion
- changing the architecture standard without an explicit amendment decision
- shipping unrelated product work as a substitute for convergence progress
- leaving architecture or repo-law debt as unnamed "later cleanup"

## Source-Of-Truth Order

Disagreement is resolved in this order:

1. [`standards/ARCHITECTURE.md`](../../standards/ARCHITECTURE.md)
2. the companion packet in [`standards/architecture/`](../../standards/architecture/)
3. [`standards/effect-laws-v1.md`](../../standards/effect-laws-v1.md) and
   [`standards/effect-first-development.md`](../../standards/effect-first-development.md)
4. [`standards/effect-laws.allowlist.jsonc`](../../standards/effect-laws.allowlist.jsonc)
   for governed repo-law exceptions
5. current repo reality when deciding migration order and compatibility
   containment
6. this `SPEC.md`
7. `PLAN.md`, `ops/manifest.json`, and the active handoff packet
8. design docs, prompts, and history outputs

## Execution-Led Worker Contract

Every worker session must load the initiative packet and ops control-plane
startup surfaces before acting. This ordered read set is the canonical startup
contract for the packet:

- `README.md`
- this `SPEC.md`
- `PLAN.md`
- `ops/README.md`
- `ops/manifest.json`
- `ops/handoffs/README.md`
- the active handoff in `ops/handoffs/` and the matching orchestrator prompt
- `history/quick-start.md`
- `ops/prompts/agent-prompts.md`
- `ops/prompt-assets/README.md`, plus the reusable prompt assets named by the
  active handoff or prompt layer

Additional required reads by work type:

- P0 batches that record baseline architecture or repo-law status must reread
  [`standards/ARCHITECTURE.md`](../../standards/ARCHITECTURE.md),
  [`standards/effect-laws-v1.md`](../../standards/effect-laws-v1.md), and
  [`standards/effect-first-development.md`](../../standards/effect-first-development.md)
  before recording baseline matrix or compliance state.
- P2 through P7 code-moving, code-review, and remediation work must also read
  [`standards/ARCHITECTURE.md`](../../standards/ARCHITECTURE.md),
  [`standards/effect-laws-v1.md`](../../standards/effect-laws-v1.md), and
  [`standards/effect-first-development.md`](../../standards/effect-first-development.md)
  before edits or gate interpretation begin.
- P7 final verification and any closeout re-check must reread those three
  standards plus `ops/compatibility-ledger.md` and
  `ops/architecture-amendment-register.md` immediately before scoring the
  matrices or claiming initiative closure.

When those inputs disagree, the source-of-truth order above wins. Required
startup aids in `ops/README.md`, `ops/prompts/`, and `ops/prompt-assets/` do
not outrank that ordered authority list. Evidence packs must record that the
worker-read contract was satisfied for the batch. Downstream ops entrypoints,
handoffs, prompts, and prompt assets may add phase-local inputs, but they may
not omit, compress, or reorder this startup contract or the source-of-truth
order above. Any weaker restatement is stale and non-authoritative; workers
must fall back to this section and `ops/manifest.json`.

## Required Durable Work Products

The following artifacts are mandatory execution outputs. The paths below are
the canonical targets even when a file has not been created yet. The `ops/*`
paths below are the only live governance locations for compatibility and
amendment state.

| Work product | Canonical path | Minimum contents | First required phase |
|---|---|---|---|
| Consumer/importer census | `history/outputs/p0-consumer-importer-census.md` | every legacy root, package, alias, script target, hard-coded entrypoint, importer count, owner, and migration batch | P0 |
| Compatibility ledger | `ops/compatibility-ledger.md` | every temporary alias or shim, owner, reason, issue, created phase, expiry or deletion phase, and proof of removal | P1 |
| Architecture-amendment register | `ops/architecture-amendment-register.md` | every unresolved constitution conflict, owner, decision phase, current containment, and resolution outcome | P1 |
| Architecture compliance scorecard | `history/outputs/p7-architecture-compliance-matrix.md` | final status for every matrix row defined in this spec, proof links, and command evidence | P7 |
| Repo-law compliance scorecard | `history/outputs/p7-repo-law-compliance-matrix.md` | final status for every repo-law row defined in this spec, allowlist references, and command evidence | P7 |
| Phase evidence pack | matching `history/outputs/p*-*.md` file for that phase | changed surfaces, worker-read acknowledgment, commands, search audits, blocker list, live-ledger delta, Graphiti note, and readiness statement | P0 |

## Phase Model

### P0 - Baseline Census, Routing Canon, and Compliance Baseline

- Must land:
  - a repo-wide workspace and package census
  - a consumer/importer census for every legacy root, alias, script target,
    hard-coded entrypoint, and app composition site
  - a route canon that assigns every legacy surface to a target package or an
    amendment candidate
  - baseline status for the architecture and repo-law matrices
- Exit requires:
  - no active legacy surface lacks an owner, destination, or migration batch
  - importer counts and remaining consumers are recorded, not inferred
  - baseline search audits are attached with exact commands and counts
- Blocks next phase when:
  - any legacy surface has no route, no owner, or no consumer/importer list
  - any route points to an architecture-invalid destination and is not in the
    architecture-amendment register

### P1 - Program Controls, Live Ledgers, and Gate Templates

- Must land:
  - the compatibility ledger in `ops/compatibility-ledger.md`
  - the architecture-amendment register in
    `ops/architecture-amendment-register.md`
  - a phase evidence template that every later phase must use
  - command-gate and search-audit templates for code-moving phases
  - manifest-state expectations for blockers, evidence, and review state
- Exit requires:
  - every known temporary alias, repo-law exception, and constitution conflict
    is governed in a durable register
  - every phase has a measurable gate definition and evidence shape
  - no later phase is allowed to close on narrative output alone
- Blocks next phase when:
  - a temporary exception exists without an owner, issue, or deletion phase
  - a constitution conflict has no amendment path or containment owner

### P2 - Enablement and Wiring Cutover

- Must land:
  - workspace-glob and workspace-package updates
  - alias, path-map, and config-sync changes
  - scaffolder and generator updates
  - docgen, repo-check, and tooling-emitter updates
  - script target, hard-coded package path, filter, and root config/task/watch
    updates, including legacy agent roots such as `.agents`, `.aiassistant`,
    `.claude`, and `.codex` where they are still treated as canonical
  - top-level app entrypoint and Layer-composition rewrites that still encode
    legacy package homes
- Exit requires:
  - the repo no longer generates or reintroduces the legacy topology through
    workspaces, scaffolders, scripts, docgen, repo checks, app assembly, or
    root config surfaces that still treat `.agents`, `.aiassistant`,
    `.claude`, or `.codex` as canonical homes
  - enablement command gates are green
  - exact search audits prove the old roots are no longer the source of truth
- Blocks next phase when:
  - any emitter, generator, script, or entrypoint still points at
    `packages/common`, top-level `tooling`, `packages/runtime`,
    `packages/shared/providers`, `.agents`, `.aiassistant`, `.claude`, or
    `.codex` as a canonical home
  - the app entrypoints still assemble legacy global Layer topology

### P3 - Shared-Kernel and Non-Slice Extraction

- Must land:
  - actual extraction work that moves domain-agnostic substrate into
    `foundation`
  - actual extraction work that moves technical boundary wrappers into
    `drivers`
  - actual contraction work that leaves `shared/*` with deliberate shared-kernel
    language only
  - justified provisional handling for any `shared/*` surface that still needs
    slice evidence before a final decision
- Exit requires:
  - every retained `shared/*` package is architecture-legal or governed as a
    temporary exception with an owner and due phase
  - mixed packages are split or blocked; they are not hand-waved
  - importer rewires and compatibility entries are reflected in the census and
    ledger
- Blocks next phase when:
  - generic substrate still lives in `shared/*` without explicit justification
  - unresolved `shared/*` ambiguity lacks an owner, due phase, or proof plan

### P4 - `repo-memory` Migration and Validation

- Must land:
  - the executed route from legacy `repo-memory` and `runtime` packages into
    canonical slice roles
  - importer rewrites, export rewrites, and app-entrypoint rewrites for the
    moved batch
  - compatibility deletions or governed temporary shims with explicit expiry
  - slice-local proof for `domain`, `use-cases`, `config`, `server`, `client`,
    and `tables` placement decisions
- Exit requires:
  - no ungoverned importer remains on the migrated legacy `repo-memory` paths
  - canonical slice boundaries are expressed in code, not only in a route table
  - slice command gates and search audits are green
- Blocks next phase when:
  - package-root or wildcard imports hide unresolved boundary work
  - app entrypoints still depend on legacy `repo-memory` or `runtime` package
    assembly

### P5 - `editor` Migration and Validation

- Must land:
  - the executed route from legacy `editor` packages into canonical slice roles
  - the `client` versus `ui` split, plus any extraction work, for
    `editor/lexical`
  - importer rewrites, export rewrites, and app-entrypoint rewrites for the
    moved batch
  - compatibility deletions or governed temporary shims with explicit expiry
- Exit requires:
  - no ungoverned importer remains on the migrated `editor` paths
  - canonical slice boundaries are expressed in code, not only in a route table
  - slice command gates and search audits are green
- Blocks next phase when:
  - `editor` retains architecture-invalid role names as live package homes
  - app entrypoints or clients still rely on legacy `editor` package routing

### P6 - Remaining Operational, App, and Agent Cutovers Plus Compatibility Deletion

- Must land:
  - remaining operational package moves that depend on slice evidence
  - agent bundle relocation into `agents/<kind>/<name>`
  - runtime-adapter cleanup so adapters are declarative and executable logic
    lives in tooling-owned packages
  - final app-consumer rewires, canonical subpath completion, and compatibility
    deletions
- Exit requires:
  - no live app, agent, or tooling path depends on the legacy topology
  - the compatibility ledger is empty or contains only an explicitly blocking
    issue being resolved in the same phase
  - runtime adapters contain configuration, not executable migration logic
- Blocks next phase when:
  - any temporary alias or shim survives without deletion proof
  - any runtime adapter still owns executable hook or runtime code

### P7 - Final Architecture and Repo-Law Verification

- Must land:
  - the final architecture compliance scorecard
  - the final repo-law compliance scorecard
  - final command-suite evidence and final search-audit evidence
  - closure of the compatibility ledger and architecture-amendment register
- Exit requires:
  - every architecture-matrix row is `Compliant` or resolved through an
    approved architecture amendment already landed in the standards
  - every repo-law-matrix row is `Compliant`
  - all required commands are green and no temporary exception remains
- Blocks initiative closure when:
  - any matrix row is `Temporary exception`, `Deferred`, `Unknown`, or `Red`
  - any command gate is stale relative to the last material repo change
  - P7 tries to absorb new implementation work instead of sending failures back
    to the owning phase

## Gate Model and Evidence Requirements

The authoritative gate model is machine-readable in
`ops/manifest.json`. Use `commandGates` for command applicability,
`searchAuditFamilies` for the controlled audit-family catalog,
`blockerTaxonomy` for blocker ids, and each `phases[]` record's
`requiredCommandIds`, `requiredSearchAuditIds`, `requiredLedgerIds`, and
`blockerIds` for closure. Handoffs, orchestrator prompts, shared prompts, and
prompt assets may explain this model for operators, but they may not narrow,
replace, or reorder it.

Every phase close must attach a phase evidence pack. A phase evidence pack must
include all of the following:

- exact changed surfaces, including packages moved, importers rewritten,
  exports changed, scripts touched, and entrypoints touched
- worker-read acknowledgment naming the root docs, standards, handoff, and
  live-ledger files read for the batch
- exact command lines run, the time they were run, and the exit result
- exact `rg` or equivalent search audits used to prove the target state
- consumer/importer batches moved and remaining consumers, with counts
- delta for `ops/compatibility-ledger.md`,
  `ops/architecture-amendment-register.md`, and
  `effect-laws.allowlist.jsonc` when applicable
- blockers discovered, disposition taken, and any reopened earlier phase
- Graphiti bootstrap and writeback status, or an explicit skipped reason when
  the environment does not provide Graphiti
- a readiness statement naming the next allowed phase

### Phase-Specific Search-Audit Contract

- The seven search-audit families in `ops/manifest.json` are the reusable
  audit catalog.
- A phase closes only against the audit-family ids listed in its own
  `phases[].requiredSearchAuditIds` entry. Extra audits are allowed, but only
  missing manifest-required ids are blocking.
- At the current manifest version, every phase record lists all seven catalog
  families. That all-seven requirement is current manifest state expressed by
  the phase records themselves, not a separate universal rule.

### Mandatory Command Gates

This table is a human-readable summary of the current
`ops/manifest.json` `commandGates` phase applicability. If the manifest is
updated, the manifest wins.

| Gate | Exact command or proof | Applies to | Blocks closure when |
|---|---|---|---|
| Graphiti bootstrap | `bun run graphiti:proxy:ensure` | phase start when Graphiti is available in the operator environment | bootstrap is required but neither succeeded nor was explicitly recorded as skipped |
| Worker-read acknowledgment | evidence-pack statement naming the required packet, standards, and live ledgers read for the batch | every phase exit | the required read set is missing from the evidence pack |
| Config sync | `bun run config-sync:check` | every phase exit | command fails |
| Type and compile checks | `bun run check` | P2 through P7 | command fails |
| Lint and allowlist integrity | `bun run lint` | P2 through P7 | command fails or new allowlist debt is undocumented |
| Test suite | `bun run test` | P2 through P7 | command fails |
| JSDoc and docgen | `bun run docgen` | P2 through P7 | command fails |
| Full repo audit | `bun run audit:full` | P2, P6, and P7 | command fails |

### Blocking Rules

- Any non-zero required command exit blocks phase closure.
- Any unowned consumer/importer blocks the owning phase and any downstream
  phase that depends on it.
- Any architecture-invalid route blocks closure unless it is explicitly in the
  architecture-amendment register with an owner and due phase.
- Any temporary alias, shim, or allowlist entry without full governance data
  blocks closure.
- Treating design docs or history outputs as the live compatibility or
  amendment ledger blocks closure.
- A weaker downstream restatement of the startup contract, source-of-truth
  order, or manifest-derived phase gate does not change closure requirements.
- Missing the required standards reread for P0 baseline scoring, code-moving,
  or final-verification work blocks closure.
- Any evidence pack that was produced before the last material code change is
  stale and blocks closure.
- Any phase that reports narrative intent without executed repo diffs is
  scaffold-only, not complete.

## Architecture Compliance Matrix

This matrix defines what "100% compliant" means against
`standards/ARCHITECTURE.md`. Final proof must mark every row `Compliant` or
`Amended`. `Temporary exception` is allowed only during active migration phases
and is not a valid closeout state.

| Architecture surface | 100% compliant means | Primary proving phases | Final proof expectation |
|---|---|---|---|
| Slice-first topology | Active product code lives in canonical slice roles instead of legacy package-role names such as `model`, `runtime`, `protocol`, `store`, or `sqlite` | P2, P4, P5, P6 | legacy-role search audits are zero and slice package routes are executed |
| Ports inward, adapters outward | Domain and use-case packages do not depend on concrete drivers or outward adapters; adapter packages own integration code | P3, P4, P5, P7 | dependency audits and import rewrites prove legal direction |
| Shared kernel contract | `packages/shared/*` contains deliberate cross-slice language only, not generic substrate or technical wrappers | P3, P7 | retained-package justifications are green and extraction work is complete |
| Rich domain and pure behavior | Domain packages model behavior and validation without infrastructure side effects | P4, P5, P7 | slice audits show no infrastructure leakage into domain |
| Schemas as executable contracts | Domain, wire, persisted, and config payloads are schema-first where the standard requires it | P4, P5, P7 | repo-law matrix rows for schema-first modeling are green |
| Topology as compressed context | Canonical package names, role modules, and mirrored paths carry architectural meaning; legacy homes are not treated as canonical aliases | P2 through P7 | import and path audits prove target topology is the repo's only source of truth |
| Non-slice family grammar | `foundation`, `drivers`, `tooling`, and `agents` are the explicit non-slice families; family and kind metadata are present where required | P2, P3, P6, P7 | metadata audits are green and no legacy family root remains canonical |
| Driver boundaries and browser entrypoints | Driver packages stay outside slices, and browser consumers import only browser-safe driver entrypoints | P3, P4, P5, P7 | import audits show `/browser` use where required and no driver leakage into pure layers |
| Foundation boundaries | Domain-agnostic reusable substrate lives in `foundation`, not `shared` or slices | P3, P7 | extracted packages and importer rewrites prove the boundary |
| Tooling boundaries and emitters | Tooling code lives in canonical tooling packages, and generators, scripts, repo checks, and docgen emit the target topology | P2, P6, P7 | enablement audit and final search audits show no legacy emitter path |
| Agent boundaries and runtime adapters | Agent bundles live under `agents/<kind>/<name>` and runtime adapters remain declarative while executable logic lives in tooling packages | P2, P6, P7 | agent and runtime-adapter audits are green |
| Layer composition | Package-local Layers stay local, and app entrypoints compose them without recreating a global legacy runtime package | P2, P4, P5, P6, P7 | app-entrypoint audits show canonical Layer assembly |
| Configuration boundaries | Config contracts flow inward legally, and domain packages do not read live runtime configuration | P2, P4, P5, P7 | import audits prove config direction and entrypoint composition rules |
| Boundary-sensitive exports | Required `/public`, `/server`, `/secrets`, `/layer`, `/test`, and `/browser` surfaces exist where needed and are used instead of ambiguous package roots | P4, P5, P6, P7 | export and importer audits are green |
| Hard-coded app and script entrypoints | Apps, scripts, filters, and hard-coded package references point at canonical homes only | P0, P2, P4, P5, P6, P7 | consumer/importer census closes with zero unresolved hard-coded consumers |
| Compatibility and amendment closure | Temporary aliases are deleted, and any lasting deviation is resolved through an approved standards amendment | P1 through P7 | `ops/compatibility-ledger.md` is empty and `ops/architecture-amendment-register.md` is closed |

## Repo-Law Compliance Matrix

This matrix defines what "100% compliant" means against the repo-law surfaces
that govern implementation quality during convergence. Final proof must mark
every row `Compliant`.

| Repo-law surface | 100% compliant means | Primary proving phases | Final proof expectation |
|---|---|---|---|
| Type-safety prohibitions | No `any`, type assertions, `@ts-ignore`, or non-null assertions remain in governed source touched by the initiative | P2 through P7 | `bun run lint`, `bun run check`, and targeted audits are green |
| Canonical Effect imports | Required `A/O/P/R/S` aliases and namespace-import rules are followed in governed source | P2 through P7 | lint plus spot audits show no import drift |
| Effect helper and data-module law | Effect modules and canonical helper namespaces replace ad hoc native helper patterns where repo law requires them | P2 through P7 | lint and targeted code audits are green |
| Typed error surfaces | Production code uses typed errors rather than native `Error`, except for governed allowlist entries | P2 through P7 | lint plus allowlist diff prove no ungoverned native error use |
| Throwable and rejection wrapping | Throwing or rejecting APIs are converted to typed Effect or Result failures at boundaries | P2 through P7 | touched boundary audits are green |
| Option and absence discipline | Nullish values are converted at boundaries and domain/runtime logic uses `Option` where repo law requires it | P2 through P7 | touched boundary audits are green |
| Schema-first data models | Domain, persisted, wire, and config payloads are modeled with Schema where the standards require it | P2 through P7 | schema-first inventory and slice proof are green |
| Boundary decoding and JSON codecs | Unknown input and JSON boundaries use `S.decodeUnknown*` and schema codecs instead of ad hoc parsing | P2 through P7 | touched boundary audits are green |
| Predicate and matching law | `Predicate`, `Match`, `A.match`, and `Bool.match` are used where repo law requires them instead of raw runtime checks or branching drift | P2 through P7 | targeted control-flow audits are green |
| Explicit service construction | Services expose explicit boundaries and do not hide dependencies in ambient state | P2 through P7 | service-definition and import audits are green |
| Layer locality and wiring | Live Layer composition stays in server/client/app entrypoints instead of pure layers or legacy runtime aggregators | P2, P4, P5, P6, P7 | entrypoint audits show legal composition |
| Runtime-boundary bans | Governed source obeys the bans on raw `typeof`, native collections, `node:path`, native `fetch`, and native `Array.sort` where the laws apply | P2 through P7 | lint and targeted boundary searches are green |
| HTTP boundary modules | Runtime HTTP uses Effect HTTP modules and explicit platform client layers | P2 through P7 | boundary audits and tests are green |
| Runtime execution boundaries | `Effect.run*` and equivalent execution calls stay in entrypoints, CLIs, hooks, or tests, not in pure layers | P2 through P7 | execution-boundary audits are green |
| JSDoc coverage | Exported APIs in `packages/*/src` and `tooling/*/src` touched by the initiative have required JSDoc | P2 through P7 | docgen-input audits and review notes are green |
| Docgen-clean examples | Export examples remain valid and docgen stays clean | P2 through P7 | `bun run docgen` is green |
| Allowlist governance integrity | `effect-laws.allowlist.jsonc` is the sole repo-law exception registry and every live entry is owned, reasoned, linked, and time-bounded when applicable | P1 through P7 | allowlist diff and lint integrity checks are green |
| Generator, script, and scaffolder hygiene | Generators, scripts, repo checks, config sync, and scaffolders emit canonical topology and lawful defaults | P2, P6, P7 | `bun run audit:full` and final search audits are green |
| Quality command freshness | Required commands are green and rerun after the last material change for the phase | P0 through P7 | evidence-pack timestamps and exit codes are current |
| Search-audit and ledger evidence integrity | Evidence packs include exact `rg` audits, live-ledger deltas from `ops/*`, blocker state, worker-read acknowledgment, and Graphiti bootstrap/writeback or skipped reason | P0 through P7 | final closeout pack is complete and current |

## Completion Criteria

This initiative is complete only when all of the following are true:

- every architecture-matrix row is `Compliant` or resolved by an approved
  standards amendment already landed
- every repo-law-matrix row is `Compliant`
- the consumer/importer census has no unowned or unresolved consumers
- `ops/compatibility-ledger.md` is empty
- `ops/architecture-amendment-register.md` is empty or closed by accepted
  amendments
- the final required command suite is green
- the final search audits show zero remaining legacy topology in canonical
  surfaces
- the final evidence pack records the required worker-read contract and
  Graphiti status
- the repo can no longer regenerate the old topology through its tooling,
  scripts, or app entrypoints
