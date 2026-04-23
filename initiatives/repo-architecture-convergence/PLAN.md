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
| Every phase | `README.md`, [SPEC.md](./SPEC.md), [PLAN.md](./PLAN.md), [ops/manifest.json](./ops/manifest.json), the active handoff in `ops/handoffs/`, and `history/quick-start.md` |
| P2 through P7 code-moving or code-review work | everything above plus `standards/ARCHITECTURE.md`, `standards/effect-laws-v1.md`, and `standards/effect-first-development.md` |
| P7 final verification, re-review, or closure scoring | reread the three standards above plus `ops/compatibility-ledger.md` and `ops/architecture-amendment-register.md` immediately before matrix scoring or closure claims |

Every phase evidence pack must record that the worker read contract was
satisfied for that batch.

## Ordered Rollout

1. **P0 - Baseline census and route canon**
   - Build the workspace census, consumer/importer census, route canon, and
     baseline compliance view.
   - Stop if any legacy surface lacks an owner, target, or migration batch.
2. **P1 - Program controls and live ledgers**
   - Stand up `ops/compatibility-ledger.md`,
     `ops/architecture-amendment-register.md`, the command-gate template, and
     the evidence-pack shape.
   - Stop if any temporary exception is unowned or any conflict lacks an
     amendment path.
3. **P2 - Enablement and wiring cutover**
   - Move workspace globs, aliases, scripts, scaffolders, docgen, repo checks,
     config sync, tooling emitters, hard-coded entrypoints, and app Layer
     assembly onto the target topology before slice migration starts.
   - Stop if any generator, script, or entrypoint can still recreate the legacy
     shape.
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
     split, canonical subpath completion, and compatibility deletion.
   - Stop if any live app, tooling, or agent path still depends on the old
     topology.
8. **P7 - Final verification and closeout**
   - Run the final architecture and repo-law proof suite against the live repo,
     close the live ledgers, and prove 100% compliance.
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
| Repo audit | `bun run audit:full` | P2, P6, P7, and any phase touching tooling, config, routing, or generators |
| Search audits | exact `rg` commands with expected counts | every phase exit |
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
- Missing the required standards reread for code-moving or final-verification
  work blocks closure.
- A phase output that only describes intended work is scaffold-only and cannot
  be marked complete.
- P7 is not a catch-all implementation phase. Any defect found there reopens
  the owning phase.

## Required Search-Audit Families

Every phase evidence pack must record the exact commands used to prove these
surfaces for its batch:

- legacy topology references
- consumer/importer counts before and after the batch
- hard-coded app and script entrypoints
- canonical subpath and export usage
- compatibility aliases and temporary shims governed in `ops/*`
- touched package metadata for family and kind compliance
- repo-law boundary surfaces touched by the batch, including type-safety,
  typed-error, schema/decode, and runtime-execution checks

## Current Planning Posture

- The initiative remains `PENDING` until P0 and P1 establish the baseline,
  live ledgers, and executable gate model.
- P2 must close before P4 or P5 can begin. The repo is not allowed to migrate
  slices while generators, scripts, or entrypoints still emit the legacy
  topology.
- P7 cannot claim success by referencing packet completeness. It must prove the
  live repo is compliant through the matrices and gate evidence defined in
  [SPEC.md](./SPEC.md).
