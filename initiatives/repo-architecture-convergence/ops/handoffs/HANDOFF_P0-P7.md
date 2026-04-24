# P0-P7 Cross-Phase Handoff

## Initiative Objective

Converge the live `beep-effect` repo onto `standards/ARCHITECTURE.md` and the
repo-law surfaces through landed repo changes plus proof. Narrative packet
completion is never enough.

## Shared Operating Rules

1. When instructions disagree, resolve them in this order:
   `standards/ARCHITECTURE.md`, `standards/architecture/*`,
   `standards/effect-laws-v1.md`, `standards/effect-first-development.md`,
   `standards/effect-laws.allowlist.jsonc` for governed repo-law exceptions,
   current repo reality when deciding migration order and compatibility
   containment, `SPEC.md`, `PLAN.md`, `ops/manifest.json`, the active handoff
   packet, then design docs, prompts, and history outputs.
2. The only live governance ledgers are `ops/compatibility-ledger.md` and
   `ops/architecture-amendment-register.md`. Treat any history or design
   ledger copies as historical context only.
3. Every phase owns an evidence pack, a review loop, manifest updates, and any
   extra durable artifacts assigned to that phase.
4. Graphiti bootstrap and writeback must be recorded for every phase when the
   environment exposes Graphiti, or explicitly skipped when unavailable.
5. Any `required-command-failed`, `worker-read-acknowledgment-missing`,
   `required-search-audit-missing`, `graphiti-obligation-unmet`,
   `stale-evidence`, `unowned-consumer-importer`,
   `ungoverned-temporary-exception`, or `narrative-only-output` blocks
   closure.
6. Later phases close only on landed repo changes plus proof. They do not
   author future-work packets in place of execution.
7. P7 is verification and closeout only. Any implementation defect found there
   reopens the owning earlier phase.

## Shared Worker-Read Contract

- Every phase must read `README.md`, `SPEC.md`, `PLAN.md`, `ops/README.md`,
  `ops/manifest.json`, `ops/handoffs/README.md`, the active handoff, the
  matching orchestrator prompt, `history/quick-start.md`,
  `ops/prompts/agent-prompts.md`, and `ops/prompt-assets/README.md` before
  action.
- Every phase must also read `ops/prompt-assets/required-outputs.md`,
  `ops/prompt-assets/verification-checks.md`,
  `ops/prompt-assets/blocker-protocol.md`,
  `ops/prompt-assets/review-loop.md`, and
  `ops/prompt-assets/manifest-and-evidence.md`.
- `P0` baseline architecture or repo-law scoring must also reread
  `standards/ARCHITECTURE.md`, `standards/effect-laws-v1.md`, and
  `standards/effect-first-development.md` before that baseline is recorded.
- `P2` through `P7` code-moving or code-review work must also read
  `standards/ARCHITECTURE.md`, `standards/effect-laws-v1.md`, and
  `standards/effect-first-development.md` before edits or gate interpretation
  begin.
- `P7` final verification and closeout re-checks must reread those three
  standards plus `ops/compatibility-ledger.md` and
  `ops/architecture-amendment-register.md` immediately before matrix scoring
  or closure claims.

## Phase Order And Dependencies

1. `P0` - Baseline Census, Routing Canon, and Compliance Baseline
2. `P1` - Program Controls, Ledgers, and Gate Templates
3. `P2` - Enablement and Wiring Cutover
4. `P3` - Shared-Kernel and Non-Slice Extraction
5. `P4` - `repo-memory` Migration and Validation
6. `P5` - `editor` Migration and Validation
7. `P6` - Remaining Operational, App, and Agent Cutovers Plus Compatibility
   Deletion
8. `P7` - Final Architecture and Repo-Law Verification

## Shared Command Stack

- Graphiti bootstrap: `bun run graphiti:proxy:ensure`
- Config sync: `bun run config-sync:check`
- Type and compile checks: `bun run check`
- Lint and allowlist integrity: `bun run lint`
- Tests: `bun run test`
- JSDoc and docgen: `bun run docgen`
- Repo audit: `bun run audit:full` always on `P2`, `P6`, and `P7`, plus any
  `P3` to `P5` batch that touches tooling, config, routing, or generators

## Shared Search-Audit Authority

The seven families below are the reusable catalog from `ops/manifest.json`.
Only the ids listed in the active phase's `requiredSearchAuditIds` record are
blocking. At the current manifest version, every phase record lists all seven
catalog families.

- legacy topology references
- consumer/importer counts before and after the batch
- hard-coded app and script entrypoints
- canonical subpath and export usage
- compatibility aliases and temporary shims
- touched package metadata for family and kind compliance
- repo-law boundary surfaces touched by the batch, including type-safety,
  typed-error, schema/decode, and runtime-execution checks

## Durable Artifact Ownership

- `P0`: `history/outputs/p0-consumer-importer-census.md`
- `P1`: `ops/compatibility-ledger.md`
- `P1`: `ops/architecture-amendment-register.md`
- `P7`: `history/outputs/p7-architecture-compliance-matrix.md`
- `P7`: `history/outputs/p7-repo-law-compliance-matrix.md`

## Blocker Rule

Use the blocker taxonomy ids in
[../prompt-assets/blocker-protocol.md](../prompt-assets/blocker-protocol.md).
If any blocking condition remains open, the phase stays out of `completed` and
the blocker must appear in the review loop, evidence pack, and manifest.
