# P4 Handoff - `repo-memory` Migration and Validation

## Objective

Land the executed `repo-memory` migration: code moves, importer rewrites,
export rewrites, app-entrypoint rewrites, governed compatibility handling, and
slice-local proof.

## Dependencies

- P0 through P3 artifact bundles must exist and be trustworthy
- shared prompt layer: [../prompts/agent-prompts.md](../prompts/agent-prompts.md)
- prompt assets: [../prompt-assets/README.md](../prompt-assets/README.md) plus
  the named asset files listed in the worker-read contract below

## Mandatory Worker-Read Contract

- Follow the exact worker-read order and source-of-truth order from
  `../../README.md`, `../../SPEC.md`, and `../manifest.json`. This handoff may
  add phase-local inputs, but it may not narrow or reorder that contract.

- Read `README.md`, `SPEC.md`, `PLAN.md`, `ops/README.md`,
  `ops/manifest.json`, `ops/handoffs/README.md`, this handoff,
  `ops/handoffs/P4_ORCHESTRATOR_PROMPT.md`, `history/quick-start.md`, and
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

- [design/repo-memory-migration.md](../../design/repo-memory-migration.md)
- [design/current-state-routing-canon.md](../../design/current-state-routing-canon.md)
- [../../history/outputs/p0-baseline-census-routing-canon-and-compliance-baseline.md](../../history/outputs/p0-baseline-census-routing-canon-and-compliance-baseline.md)
- [../../history/outputs/p1-program-controls-ledgers-and-gate-templates.md](../../history/outputs/p1-program-controls-ledgers-and-gate-templates.md)
- [../../history/outputs/p2-enablement-and-wiring-cutover.md](../../history/outputs/p2-enablement-and-wiring-cutover.md)
- [../../history/outputs/p3-shared-kernel-and-non-slice-extraction.md](../../history/outputs/p3-shared-kernel-and-non-slice-extraction.md)
- [../compatibility-ledger.md](../compatibility-ledger.md)
- [../architecture-amendment-register.md](../architecture-amendment-register.md)

## Required Artifact Bundle

- evidence pack:
  `history/outputs/p4-repo-memory-migration-and-validation.md`
- critique: `history/reviews/p4-critique.md`
- remediation: `history/reviews/p4-remediation.md`
- re-review: `history/reviews/p4-rereview.md`
- manifest: `ops/manifest.json`

## Must Land

1. The executed route from legacy `repo-memory` and `runtime` packages into
   canonical slice roles.
2. Importer rewrites, export rewrites, and app-entrypoint rewrites for the
   migrated batch.
3. Compatibility deletions or governed temporary shims with explicit expiry.
4. Slice-local proof for `domain`, `use-cases`, `config`, `server`, `client`,
   and `tables` placement decisions.
5. Evidence that no ungoverned importer remains on the migrated legacy paths.

## Required Command Gates

- `bun run graphiti:proxy:ensure` at phase start when Graphiti is available
- `bun run config-sync:check`
- `bun run check`
- `bun run lint`
- `bun run test`
- `bun run docgen`
- `bun run audit:full` when the batch touches tooling, config, routing, or
  generators, or record an explicit out-of-scope reason

## Required Search Audits

`ops/manifest.json` is authoritative for blocking search audits. The active
`P4` record currently lists all seven catalog families, so record:

- legacy topology references
- consumer/importer counts before and after the batch
- hard-coded app and script entrypoints
- canonical subpath and export usage
- compatibility aliases and temporary shims
- touched package metadata for family and kind compliance
- repo-law boundary surfaces touched by the batch, including type-safety,
  typed-error, schema/decode, and runtime-execution checks

## Blocking Conditions

- `missing-route-or-owner`
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

P4 is complete when canonical slice boundaries are expressed in code, no
ungoverned importer remains on legacy `repo-memory` paths, required commands
and search audits are green, and the review loop clears the migrated batch.
