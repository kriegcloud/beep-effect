# Repo Architecture Convergence

## Status

Pending

## Initiative Contract

This initiative is the execution-led program for getting the live
`beep-effect` repo to 100% compliance with
[`standards/ARCHITECTURE.md`](../../standards/ARCHITECTURE.md) and the
repo-law surfaces that govern implementation quality and execution hygiene. It
does not close when the packet is filled out. It closes only when the repo has
changed, the required command gates are green, the search audits match the
target state, the live governance ledgers are current, and the phase evidence
proves the result.

Temporary compatibility aliases, allowlist entries, and routing exceptions are
allowed only as governed migration instruments. Each one must have an owner,
reason, issue, creation phase, expiry or deletion phase, and proof plan.
End-state requires zero temporary exceptions. Anything permanent must become an
approved architecture amendment.

The authoritative live governance plane for this initiative is
[`ops/`](./ops). Compatibility and amendment governance live only in
[`ops/compatibility-ledger.md`](./ops/compatibility-ledger.md) and
[`ops/architecture-amendment-register.md`](./ops/architecture-amendment-register.md).
Design notes and history outputs may discuss those ledgers, but they are not
the live closeout authority.

## Execution-Led Phase Rules

- P0 and P1 are control-plane phases. They close only when the baseline,
  ledgers, templates, and manifest state are landed and evidenced.
- P2 through P6 are code-moving and cutover phases. They close only on
  executed repo diffs plus current command, audit, and ledger proof.
- P7 is verification-only. It scores the live repo, closes the live ledgers,
  and reopens earlier phases when proof fails instead of absorbing new
  implementation work.
- Narrative output, packet completion, or scaffold files never count as phase
  completion on their own.

## Shared Worker Read Contract

| Work type | Mandatory inputs before action |
|---|---|
| Every phase | `README.md`, [`SPEC.md`](./SPEC.md), [`PLAN.md`](./PLAN.md), [`ops/manifest.json`](./ops/manifest.json), the active handoff in [`ops/handoffs/`](./ops/handoffs), and [`history/quick-start.md`](./history/quick-start.md) |
| Any code-moving or code-reviewing work in P2 through P7 | everything above plus [`standards/ARCHITECTURE.md`](../../standards/ARCHITECTURE.md), [`standards/effect-laws-v1.md`](../../standards/effect-laws-v1.md), and [`standards/effect-first-development.md`](../../standards/effect-first-development.md) |
| P7 final verification and any closeout re-check | reread the three standards above plus `ops/compatibility-ledger.md` and `ops/architecture-amendment-register.md` immediately before scoring matrices or claiming closure |

When instructions disagree, resolve them in this order: standards, `SPEC.md`,
`PLAN.md`, active handoff, then historical/design context.

## Required Work Products

| Work product | Canonical path | Why it exists |
|---|---|---|
| Consumer/importer census | `history/outputs/p0-consumer-importer-census.md` | Proves every legacy package, alias, script target, hard-coded entrypoint, and app composition site has an owner and a migration batch |
| Compatibility ledger | `ops/compatibility-ledger.md` | Tracks every temporary alias, shim, and dual-route until deletion proof is attached |
| Architecture-amendment register | `ops/architecture-amendment-register.md` | Captures every constitution conflict that migration alone cannot resolve |
| Architecture compliance matrix | `history/outputs/p7-architecture-compliance-matrix.md` | Measures the repo against the binding sections of `standards/ARCHITECTURE.md` |
| Repo-law compliance matrix | `history/outputs/p7-repo-law-compliance-matrix.md` | Measures the repo-law surfaces at the granularity required to prove literal 100% compliance |
| Phase evidence packs | matching `history/outputs/p*-*.md` files | Capture changed surfaces, worker-read acknowledgment, commands, audits, blockers, ledger deltas, Graphiti status, and readiness statements |

## Phase Model

| Phase | Execution focus | Cannot close until |
|---|---|---|
| P0 | Baseline census, routing canon, consumer/importer census, and compliance baseline | Every legacy surface has an owner, a target route, a consumer list, and a proving phase |
| P1 | Program controls, live ledgers, evidence templates, and amendment workflow | Compatibility, amendment, and proof-tracking controls exist in `ops/` and are ready to block later phases |
| P2 | Early enablement and wiring cutover | Workspace globs, aliases, scripts, scaffolders, docgen, repo checks, config sync, tooling emitters, hard-coded entrypoints, and app Layer assembly stop regenerating the legacy topology |
| P3 | Shared-kernel and non-slice extraction | `shared/*`, `foundation`, `drivers`, and related package families are reduced to architecture-legal roles with governed exceptions only |
| P4 | `repo-memory` migration and validation | The slice is moved, importers are rewired, app entrypoints are updated, and the phase gate is green |
| P5 | `editor` migration and validation | The slice is moved, importers are rewired, app entrypoints are updated, and the phase gate is green |
| P6 | Remaining operational, app, and agent cutovers plus compatibility deletion | Agents, tooling-owned executables, remaining app consumers, and temporary aliases are fully cut over or deleted |
| P7 | Final architecture and repo-law verification | Both compliance matrices are 100% green, the full command suite passes, the live ledgers are closed, and no temporary exceptions remain |

## Mandatory Gates

- `bun run graphiti:proxy:ensure` or an explicit skipped reason is required at
  phase start when Graphiti is available.
- `bun run config-sync:check` is required on every phase exit.
- `bun run check`, `bun run lint`, `bun run test`, and `bun run docgen` are
  required on every code-moving phase exit from P2 through P7.
- `bun run audit:full` is required on P2, P6, P7, and any phase that changes
  tooling, routing, config, or generator surfaces.
- Exact `rg` audits, live-ledger deltas from `ops/*`, blocker status, worker
  read acknowledgment, and Graphiti writeback or explicit skipped reason must
  be recorded in every phase evidence pack.

## Read This First

- [SPEC.md](./SPEC.md) - authoritative execution contract, worker read rules,
  phase gates, and compliance matrices
- [PLAN.md](./PLAN.md) - ordered rollout, gate stack, and stop-the-line rules
- [ops/README.md](./ops/README.md) - canonical execution surface and manifest
  flow
- [ops/manifest.json](./ops/manifest.json) - machine-readable phase routing
- [ops/compatibility-ledger.md](./ops/compatibility-ledger.md) - live
  compatibility governance target
- [ops/architecture-amendment-register.md](./ops/architecture-amendment-register.md)
  - live amendment governance target
- [ops/handoffs/](./ops/handoffs) - orchestrator handoffs and prompts
- [design/](./design) - design-level routing and migration notes that do not
  override the live governance plane
- [history/quick-start.md](./history/quick-start.md) - operator bootstrap
- [history/reflection-log.md](./history/reflection-log.md) - learnings that do
  not replace structured evidence
