# P6 Handoff - Remaining Operational, App, and Agent Cutovers Plus Compatibility Deletion

## Objective

Land the remaining operational package moves, agent bundle relocation,
runtime-adapter cleanup, final app-consumer rewires, canonical subpath
completion, and compatibility deletions that depend on earlier slice evidence.

## Dependencies

- P0 through P5 artifact bundles must exist and be trustworthy
- shared prompt layer: [../prompts/agent-prompts.md](../prompts/agent-prompts.md)
- prompt assets: [../prompt-assets/README.md](../prompt-assets/README.md) plus
  the named asset files listed in the worker-read contract below

## Mandatory Worker-Read Contract

- Follow the exact worker-read order and source-of-truth order from
  `../../README.md`, `../../SPEC.md`, and `../manifest.json`. This handoff may
  add phase-local inputs, but it may not narrow or reorder that contract.

- Read `README.md`, `SPEC.md`, `PLAN.md`, `ops/README.md`,
  `ops/manifest.json`, `ops/handoffs/README.md`, this handoff,
  `ops/handoffs/P6_ORCHESTRATOR_PROMPT.md`, `history/quick-start.md`, and
  `ops/prompts/agent-prompts.md` before action.
- Read `ops/prompt-assets/README.md`,
  `ops/prompt-assets/required-outputs.md`,
  `ops/prompt-assets/verification-checks.md`,
  `ops/prompt-assets/blocker-protocol.md`,
  `ops/prompt-assets/review-loop.md`, and
  `ops/prompt-assets/manifest-and-evidence.md`.
- Read `standards/ARCHITECTURE.md`, `standards/effect-laws-v1.md`, and
  `standards/effect-first-development.md` before edits or gate interpretation
  begin.

## Phase-Specific Supporting Inputs

- [design/non-slice-family-migration.md](../../design/non-slice-family-migration.md)
- [design/tooling-and-agent-cutover.md](../../design/tooling-and-agent-cutover.md)
- [../../history/outputs/p0-baseline-census-routing-canon-and-compliance-baseline.md](../../history/outputs/p0-baseline-census-routing-canon-and-compliance-baseline.md)
- [../../history/outputs/p0-consumer-importer-census.md](../../history/outputs/p0-consumer-importer-census.md)
- [../../history/outputs/p1-program-controls-ledgers-and-gate-templates.md](../../history/outputs/p1-program-controls-ledgers-and-gate-templates.md)
- [../../history/outputs/p2-enablement-and-wiring-cutover.md](../../history/outputs/p2-enablement-and-wiring-cutover.md)
- [../../history/outputs/p3-shared-kernel-and-non-slice-extraction.md](../../history/outputs/p3-shared-kernel-and-non-slice-extraction.md)
- [../../history/outputs/p4-repo-memory-migration-and-validation.md](../../history/outputs/p4-repo-memory-migration-and-validation.md)
- [../../history/outputs/p5-editor-migration-and-validation.md](../../history/outputs/p5-editor-migration-and-validation.md)
- [../compatibility-ledger.md](../compatibility-ledger.md)
- [../architecture-amendment-register.md](../architecture-amendment-register.md)

## Required Artifact Bundle

- evidence pack:
  `history/outputs/p6-operational-app-agent-cutovers-and-compatibility-deletion.md`
- critique: `history/reviews/p6-critique.md`
- remediation: `history/reviews/p6-remediation.md`
- re-review: `history/reviews/p6-rereview.md`
- manifest: `ops/manifest.json`

## Must Land

1. Remaining operational package moves that depend on slice evidence.
2. Agent bundle relocation from `.agents`, `.aiassistant`, `.claude`, and
   `.codex` into the canonical agent destinations defined by the live routing
   packet or tooling-owned destinations, while keeping agent-instruction text
   lightweight and pathless where the authoritative `.aiassistant` rule
   requires it.
3. Runtime-adapter cleanup so adapters are declarative and executable logic
   lives in tooling-owned packages.
4. Final app-consumer rewires, canonical subpath completion, and compatibility
   deletions.
5. Evidence that no live app, agent, or tooling path still depends on the
   legacy topology.

## Required Command Gates

- `bun run graphiti:proxy:ensure` at phase start when Graphiti is available
- `bun run config-sync:check`
- `bun run check`
- `bun run lint`
- `bun run test`
- `bun run docgen`
- `bun run audit:full`

## Required Search Audits

`ops/manifest.json` is authoritative for blocking search audits. The active
`P6` record currently lists all seven catalog families, so record:

- legacy topology references
- consumer/importer counts before and after the batch
- hard-coded app and script entrypoints
- canonical subpath and export usage
- compatibility aliases and temporary shims
- touched package metadata for family and kind compliance
- repo-law boundary surfaces touched by the batch, including type-safety,
  typed-error, schema/decode, and runtime-execution checks

## Blocking Conditions

- `unowned-consumer-importer`
- `architecture-invalid-route`
- `ungoverned-temporary-exception`
- `required-command-failed`
- `worker-read-acknowledgment-missing`
- `required-search-audit-missing`
- `graphiti-obligation-unmet`
- `stale-evidence`
- `narrative-only-output`

## Exit Gate

P6 is complete when no live app, agent, or tooling path depends on the legacy
topology, the compatibility ledger is empty or contains only the blocking issue
being resolved in the same phase, runtime adapters are declarative,
agent-instruction text stays aligned with the authoritative lightweight/pathless
`.aiassistant` rule, and the review loop clears the landed cutover.
