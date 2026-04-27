# Repo Architecture Convergence Plan

This plan executes the contract in [SPEC.md](./SPEC.md). It is execution-led:
no phase is complete until landed repo diffs, live-governance updates, and
current evidence are all present.

## Execution-Led Program Rules

- P0 and P1 are control-plane phases. They close only when the baseline,
  ledgers, templates, and manifest state are landed and evidenced.
- P2 through P6 are code-moving and cutover phases. They close only on
  executed repo diffs plus current command, audit, and ledger proof.
- P7 is final verification only. It scores the live repo against the matrices,
  closes the live ledgers, and reopens the owning phase when proof fails.
- The authoritative live governance plane is `ops/`. Compatibility and
  amendment updates belong only in `ops/compatibility-ledger.md` and
  `ops/architecture-amendment-register.md`.

## Shared Worker Read Contract

| Work type | Required inputs before action |
|---|---|
| Every phase | `README.md`, [SPEC.md](./SPEC.md), [PLAN.md](./PLAN.md), [ops/README.md](./ops/README.md), [ops/manifest.json](./ops/manifest.json), [ops/handoffs/README.md](./ops/handoffs/README.md), the active handoff and matching orchestrator prompt in `ops/handoffs/`, `history/quick-start.md`, [ops/prompts/agent-prompts.md](./ops/prompts/agent-prompts.md), and [ops/prompt-assets/README.md](./ops/prompt-assets/README.md); then load the prompt assets named by the active handoff and prompt layer before execution starts |
| P0 batches that record baseline architecture or repo-law status | reread `standards/ARCHITECTURE.md`, `standards/effect-laws-v1.md`, and `standards/effect-first-development.md` before recording baseline matrix or compliance status |
| P2 through P7 code-moving, code-review, or remediation work | everything above plus `standards/ARCHITECTURE.md`, `standards/effect-laws-v1.md`, and `standards/effect-first-development.md` before edits or gate interpretation begin |
| P7 final verification, re-review, or closure scoring | reread the three standards above plus `ops/compatibility-ledger.md` and `ops/architecture-amendment-register.md` immediately before matrix scoring or closure claims |

Every phase evidence pack must record that the worker read contract was
satisfied for that batch.

Use the exact [Source-Of-Truth Order](./SPEC.md#source-of-truth-order) from
`SPEC.md`. This plan does not define a shorter precedence rule, and required
startup aids in `ops/README.md`, `ops/prompts/`, or `ops/prompt-assets/` do
not outrank that authority order. Downstream ops entrypoints may add
phase-local inputs, but they may not omit, compress, or reorder the startup
contract or authority order defined by the root docs and
[`ops/manifest.json`](./ops/manifest.json).

## Ordered Rollout

1. **P0 - Baseline census and route canon**
   - Build the workspace census, consumer/importer census, route canon, and
     baseline compliance view.
   - Reread the governing standards before recording any baseline architecture
     or repo-law status.
   - Stop if any legacy surface lacks an owner, target, or migration batch.
2. **P1 - Program controls and live ledgers**
   - Stand up `ops/compatibility-ledger.md`,
     `ops/architecture-amendment-register.md`, the command-gate template, and
     the evidence-pack shape.
   - Stop if any temporary exception is unowned or any conflict lacks an
     amendment path.
3. **P2 - Enablement and wiring cutover**
   - Move workspace globs, aliases, scripts, scaffolders, docgen, repo checks,
     config sync, tooling emitters, hard-coded entrypoints, root
     config/task/watch surfaces, and app Layer assembly onto the target
     topology before slice migration starts.
   - Stop if any generator, script, root config surface, or entrypoint can
     still recreate the legacy shape or still treat `.agents`, `.aiassistant`,
     `.claude`, or `.codex` as canonical homes, or if the batch violates the
     authoritative lightweight/pathless `.aiassistant` rule.
4. **P3 - Shared-kernel and non-slice extraction**
   - Execute the `shared/*`, `foundation`, and `drivers` split so later slice
     work is not built on illegal shared boundaries.
   - Stop if mixed packages remain unclassified or unjustified.
5. **P4 - `repo-memory` migration**
   - Migrate the slice, rewire importers, cut over entrypoints, and delete or
     govern any temporary shims.
   - Stop if legacy `repo-memory` or `runtime` package homes still carry live
     consumers.
6. **P5 - `editor` migration**
   - Migrate the slice, resolve the `client` versus `ui` split, rewire
     importers, cut over entrypoints, and delete or govern temporary shims.
   - Stop if legacy `editor` package homes still carry live consumers.
7. **P6 - Remaining operational, app, and agent cutovers**
   - Finish the remaining operational package moves, agent/runtime-adapter
     split, canonical subpath completion, and compatibility deletion while
     keeping agent-instruction text aligned with the authoritative
     lightweight/pathless `.aiassistant` rule.
   - Stop if any live app, tooling, or agent path still depends on the old
     topology.
8. **P7 - Final verification and closeout**
   - Run the final architecture and repo-law proof suite against the live repo,
     close the live ledgers, and prove 100% compliance.
   - Reread the three governing standards plus the two live `ops/*` ledgers
     immediately before any final matrix scoring or closure claim.
   - Stop if any matrix row is not green, any ledger remains open without an
     approved amendment outcome, or any command evidence is stale.

## Mandatory Gate Stack

| Gate | Exact command or proof | When it is mandatory |
|---|---|---|
| Graphiti bootstrap | `bun run graphiti:proxy:ensure` or explicit skipped reason | phase start when Graphiti is available |
| Worker read acknowledgment | evidence-pack statement naming the required packet, standards, and live-ledger files read for the batch | every phase exit |
| Config sync | `bun run config-sync:check` | every phase exit |
| Type and compile checks | `bun run check` | every code-moving phase exit from P2 through P7 |
| Lint and allowlist integrity | `bun run lint` | every code-moving phase exit from P2 through P7 |
| Tests | `bun run test` | every code-moving phase exit from P2 through P7 |
| JSDoc and docgen | `bun run docgen` | every code-moving phase exit from P2 through P7 |
| Repo audit | `bun run audit:full` | P2, P6, and P7 per `ops/manifest.json` |
| Search audits | exact `rg` commands with expected counts for the active phase's `requiredSearchAuditIds` in `ops/manifest.json` | every phase exit |
| Ledger updates | `ops/compatibility-ledger.md`, `ops/architecture-amendment-register.md`, and allowlist delta when applicable | every phase exit |
| Evidence pack | changed surfaces, commands, audits, blockers, Graphiti note, readiness statement | every phase exit |

## Stop-The-Line Rules

- A required command failure blocks the current phase.
- An unresolved consumer/importer blocks the owning phase and all downstream
  phases that depend on it.
- An architecture-invalid route blocks closure unless it is explicitly in
  `ops/architecture-amendment-register.md` with an owner and decision phase.
- A temporary alias, shim, or allowlist entry without full governance data
  blocks closure.
- Treating any design or history ledger reference as the live governance state
  blocks closure.
- Missing the required standards reread for P0 baseline scoring, code-moving,
  or final-verification work blocks closure.
- A phase output that only describes intended work is scaffold-only and cannot
  be marked complete.
- P7 is not a catch-all implementation phase. Any defect found there reopens
  the owning phase.

## Manifest-Anchored Search-Audit Model

[`ops/manifest.json`](./ops/manifest.json) is authoritative for search audits:
`searchAuditFamilies` defines the reusable audit id catalog, and each phase's
`requiredSearchAuditIds` defines the blocking subset for that phase. The root
packet does not impose a second search-audit authority outside those phase
records. At the current manifest version, every phase record lists all seven
catalog families, so every phase currently owes all seven. If a future manifest
revision narrows a phase, the phase record wins immediately.

## Current Planning Posture

- The initiative remains `PENDING` until P0 and P1 establish the baseline,
  live ledgers, and executable gate model.
- P2 must close before P4 or P5 can begin. The repo is not allowed to migrate
  slices while generators, scripts, or entrypoints still emit the legacy
  topology.
- P7 cannot claim success by referencing packet completeness. It must prove the
  live repo is compliant through the matrices and gate evidence defined in
  [SPEC.md](./SPEC.md).
