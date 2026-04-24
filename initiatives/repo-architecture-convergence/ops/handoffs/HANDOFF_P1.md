# P1 Handoff - Program Controls, Ledgers, and Gate Templates

## Objective

Land the durable control-plane artifacts that every later execution phase
depends on: authoritative ledgers, gate templates, evidence-pack expectations,
and manifest-state rules.

## Dependencies

- P0 artifact bundle must exist and be trustworthy
- shared prompt layer: [../prompts/agent-prompts.md](../prompts/agent-prompts.md)
- prompt assets: [../prompt-assets/README.md](../prompt-assets/README.md) plus
  the named asset files listed in the worker-read contract below

## Mandatory Worker-Read Contract

- Follow the exact worker-read order and source-of-truth order from
  `../../README.md`, `../../SPEC.md`, and `../manifest.json`. This handoff may
  add phase-local inputs, but it may not narrow or reorder that contract.

- Read `README.md`, `SPEC.md`, `PLAN.md`, `ops/README.md`,
  `ops/manifest.json`, `ops/handoffs/README.md`, this handoff,
  `ops/handoffs/P1_ORCHESTRATOR_PROMPT.md`, `history/quick-start.md`, and
  `ops/prompts/agent-prompts.md` before action.
- Read `ops/prompt-assets/README.md`,
  `ops/prompt-assets/required-outputs.md`,
  `ops/prompt-assets/verification-checks.md`,
  `ops/prompt-assets/blocker-protocol.md`,
  `ops/prompt-assets/review-loop.md`, and
  `ops/prompt-assets/manifest-and-evidence.md`.

## Phase-Specific Supporting Inputs

- [../../history/outputs/p0-baseline-census-routing-canon-and-compliance-baseline.md](../../history/outputs/p0-baseline-census-routing-canon-and-compliance-baseline.md)
- [../../history/outputs/p0-consumer-importer-census.md](../../history/outputs/p0-consumer-importer-census.md)

## Required Artifact Bundle

- evidence pack:
  `history/outputs/p1-program-controls-ledgers-and-gate-templates.md`
- durable output: `ops/compatibility-ledger.md`
- durable output: `ops/architecture-amendment-register.md`
- critique: `history/reviews/p1-critique.md`
- remediation: `history/reviews/p1-remediation.md`
- re-review: `history/reviews/p1-rereview.md`
- manifest: `ops/manifest.json`

## Must Land

1. The compatibility ledger at `ops/compatibility-ledger.md`, including shim
   kind, canonical replacement, affected consumers, deletion gate, validation
   query, and allowlist linkage fields.
2. The architecture-amendment register at
   `ops/architecture-amendment-register.md`.
3. The phase evidence-pack template and exact command/search proof contract for
   later phases.
4. Manifest expectations for blocker state, evidence freshness, and review-loop
   progression.
5. Governance expectations for temporary aliases, shims, allowlist entries, and
   amendment candidates.

## Required Command Gates

- `bun run graphiti:proxy:ensure` at phase start when Graphiti is available
- `bun run config-sync:check`

## Required Search Audits

`ops/manifest.json` is authoritative for blocking search audits. The active
`P1` record currently lists all seven catalog families, so record:

- legacy topology references
- consumer/importer counts before and after the batch
- hard-coded app and script entrypoints
- canonical subpath and export usage
- compatibility aliases and temporary shims
- touched package metadata for family and kind compliance
- repo-law boundary surfaces touched by the batch, including type-safety,
  typed-error, schema/decode, and runtime-execution checks

## Blocking Conditions

- `missing-source-artifact`
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

P1 is complete when every known temporary exception and constitution conflict
has a durable home, every later phase has a measurable gate definition, and no
phase can be closed on narrative output alone.
