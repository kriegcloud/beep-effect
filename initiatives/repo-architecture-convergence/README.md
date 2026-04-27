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
| Every phase | `README.md`, [`SPEC.md`](./SPEC.md), [`PLAN.md`](./PLAN.md), [`ops/README.md`](./ops/README.md), [`ops/manifest.json`](./ops/manifest.json), [`ops/handoffs/README.md`](./ops/handoffs/README.md), the active handoff and matching orchestrator prompt in [`ops/handoffs/`](./ops/handoffs), [`history/quick-start.md`](./history/quick-start.md), [`ops/prompts/agent-prompts.md`](./ops/prompts/agent-prompts.md), and [`ops/prompt-assets/README.md`](./ops/prompt-assets/README.md); then load the prompt assets named by the active handoff and prompt layer before execution starts |
| P0 batches that record baseline architecture or repo-law status | reread [`standards/ARCHITECTURE.md`](../../standards/ARCHITECTURE.md), [`standards/effect-laws-v1.md`](../../standards/effect-laws-v1.md), and [`standards/effect-first-development.md`](../../standards/effect-first-development.md) before recording baseline matrix or compliance status |
| Any code-moving, code-reviewing, or remediation work in P2 through P7 | everything above plus [`standards/ARCHITECTURE.md`](../../standards/ARCHITECTURE.md), [`standards/effect-laws-v1.md`](../../standards/effect-laws-v1.md), and [`standards/effect-first-development.md`](../../standards/effect-first-development.md) before edits or gate interpretation begin |
| P7 final verification and any closeout re-check | reread the three standards above plus `ops/compatibility-ledger.md` and `ops/architecture-amendment-register.md` immediately before scoring matrices or claiming closure |

When instructions disagree, use the exact source-of-truth order from
[`SPEC.md`](./SPEC.md):

1. [`standards/ARCHITECTURE.md`](../../standards/ARCHITECTURE.md)
2. the companion packet in [`standards/architecture/`](../../standards/architecture/)
3. [`standards/effect-laws-v1.md`](../../standards/effect-laws-v1.md) and [`standards/effect-first-development.md`](../../standards/effect-first-development.md)
4. [`standards/effect-laws.allowlist.jsonc`](../../standards/effect-laws.allowlist.jsonc) for governed repo-law exceptions
5. current repo reality when deciding migration order and compatibility containment
6. [`SPEC.md`](./SPEC.md)
7. [`PLAN.md`](./PLAN.md), [`ops/manifest.json`](./ops/manifest.json), and the active handoff packet
8. design docs, prompts, and history outputs

Downstream ops entrypoints may add phase-local inputs, but they may not omit,
compress, or reorder this worker-read contract or authority order. If a
handoff, prompt, or helper restates a smaller contract, treat that wording as
stale and follow [`SPEC.md`](./SPEC.md) plus
[`ops/manifest.json`](./ops/manifest.json).

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
| P2 | Early enablement and wiring cutover | Workspace globs, aliases, scripts, scaffolders, docgen, repo checks, config sync, tooling emitters, hard-coded entrypoints, root config/task/watch surfaces, and app Layer assembly stop regenerating the legacy topology or treating `.agents`, `.aiassistant`, `.claude`, or `.codex` as canonical homes, and any agent-root instruction/config cleanup stays aligned with the authoritative lightweight/pathless `.aiassistant` rule |
| P3 | Shared-kernel and non-slice extraction | `shared/*`, `foundation`, `drivers`, and related package families are reduced to architecture-legal roles with governed exceptions only |
| P4 | `repo-memory` migration and validation | The slice is moved, importers are rewired, app entrypoints are updated, and the phase gate is green |
| P5 | `editor` migration and validation | The slice is moved, importers are rewired, app entrypoints are updated, and the phase gate is green |
| P6 | Remaining operational, app, and agent cutovers plus compatibility deletion | Agents, tooling-owned executables, remaining app consumers, and temporary aliases are fully cut over or deleted, and agent-instruction text stays aligned with the authoritative lightweight/pathless `.aiassistant` rule |
| P7 | Final architecture and repo-law verification | Both compliance matrices are 100% green, the full command suite passes, the live ledgers are closed, and no temporary exceptions remain |

## Manifest-Anchored Gate Model

- [`ops/manifest.json`](./ops/manifest.json) is the authoritative
  machine-readable phase gate. Use each phase record's
  `requiredCommandIds`, `requiredSearchAuditIds`, `requiredLedgerIds`, and
  `blockerIds` as the binding closure contract.
- The seven search-audit families in `ops/manifest.json` are the reusable
  audit catalog. Only a phase's own `phases[].requiredSearchAuditIds` entry is
  blocking.
- At the current manifest version, every phase record lists all seven catalog
  families. That all-seven requirement is current manifest state, not a second
  authority outside the phase records.
- Handoffs, orchestrator prompts, shared prompts, and prompt assets may add
  execution detail or record extra `N/A` context, but they may not weaken the
  startup contract, authority order, or manifest-derived phase gate.

## Mandatory Gates

- The current manifest-controlled gate summary is:
- `bun run graphiti:proxy:ensure` or an explicit skipped reason is required at
  phase start when Graphiti is available.
- `bun run config-sync:check` is required on every phase exit.
- `bun run check`, `bun run lint`, `bun run test`, and `bun run docgen` are
  required on every code-moving phase exit from P2 through P7.
- At the current manifest version, `bun run audit:full` is required on P2, P6,
  and P7.
- Exact `rg` audits named by the active phase's
  `requiredSearchAuditIds` in [`ops/manifest.json`](./ops/manifest.json),
  live-ledger deltas from `ops/*`, blocker status, worker-read
  acknowledgment, and Graphiti writeback or explicit skipped reason must be
  recorded in every phase evidence pack.

## Read This First

- [SPEC.md](./SPEC.md) - authoritative execution contract, worker read rules,
  phase gates, and compliance matrices
- [PLAN.md](./PLAN.md) - ordered rollout, gate stack, and stop-the-line rules
- [ops/README.md](./ops/README.md) - canonical execution surface and manifest
  flow
- [ops/manifest.json](./ops/manifest.json) - machine-readable phase routing
- [ops/handoffs/README.md](./ops/handoffs/README.md) - handoff operating
  model and orchestrator-prompt expectations
- [ops/handoffs/](./ops/handoffs) - active handoff packet and matching
  orchestrator prompt
- [history/quick-start.md](./history/quick-start.md) - operator bootstrap
- [ops/prompts/agent-prompts.md](./ops/prompts/agent-prompts.md) - shared
  worker startup and closeout duties
- [ops/prompt-assets/README.md](./ops/prompt-assets/README.md) - reusable
  prompt-asset index loaded by the active handoff
- [ops/compatibility-ledger.md](./ops/compatibility-ledger.md) - live
  compatibility governance target
- [ops/architecture-amendment-register.md](./ops/architecture-amendment-register.md)
  - live amendment governance target
- [design/](./design) - design-level routing and migration notes that do not
  override the live governance plane
- [history/reflection-log.md](./history/reflection-log.md) - learnings that do
  not replace structured evidence
