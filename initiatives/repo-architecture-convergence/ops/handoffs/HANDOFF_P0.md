# P0 Handoff - Baseline Census, Routing Canon, and Compliance Baseline

## Objective

Land the baseline census bundle and proof needed to start executed migration
work. P0 closes on explicit census data, route ownership, and baseline proof,
not on high-level planning language.

## Dependencies

- none
- shared prompt layer: [../prompts/agent-prompts.md](../prompts/agent-prompts.md)
- prompt assets: [../prompt-assets/README.md](../prompt-assets/README.md) plus
  the named asset files listed in the worker-read contract below

## Mandatory Worker-Read Contract

- Follow the exact worker-read order and source-of-truth order from
  `../../README.md`, `../../SPEC.md`, and `../manifest.json`. This handoff may
  add phase-local inputs, but it may not narrow or reorder that contract.

- Read `README.md`, `SPEC.md`, `PLAN.md`, `ops/README.md`,
  `ops/manifest.json`, `ops/handoffs/README.md`, this handoff,
  `ops/handoffs/P0_ORCHESTRATOR_PROMPT.md`, `history/quick-start.md`, and
  `ops/prompts/agent-prompts.md` before action.
- Read `ops/prompt-assets/README.md`,
  `ops/prompt-assets/required-outputs.md`,
  `ops/prompt-assets/verification-checks.md`,
  `ops/prompt-assets/blocker-protocol.md`,
  `ops/prompt-assets/review-loop.md`, and
  `ops/prompt-assets/manifest-and-evidence.md`.
- Reread `standards/ARCHITECTURE.md`, `standards/effect-laws-v1.md`, and
  `standards/effect-first-development.md` before recording baseline
  architecture or repo-law status.

## Phase-Specific Supporting Inputs

- [design/current-state-routing-canon.md](../../design/current-state-routing-canon.md)
- [design/legacy-path-coupling-inventory.md](../../design/legacy-path-coupling-inventory.md)
- [design/agent-runtime-decomposition-matrix.md](../../design/agent-runtime-decomposition-matrix.md)
- [design/non-slice-family-migration.md](../../design/non-slice-family-migration.md)

## Required Artifact Bundle

- evidence pack:
  `history/outputs/p0-baseline-census-routing-canon-and-compliance-baseline.md`
- durable output: `history/outputs/p0-consumer-importer-census.md`
- critique: `history/reviews/p0-critique.md`
- remediation: `history/reviews/p0-remediation.md`
- re-review: `history/reviews/p0-rereview.md`
- manifest: `ops/manifest.json`

## Must Land

1. A repo-wide workspace and package census for every active legacy surface.
2. A consumer/importer census for every legacy root, alias, script target,
   hard-coded entrypoint, and app composition site, with counts and owners.
3. A route canon that assigns every legacy surface and routed agent-root file
   class to a target package or an amendment candidate.
4. Baseline status for the architecture and repo-law matrices.
5. Explicit downstream phase dependencies and migration-batch ownership.

## Required Command Gates

- `bun run graphiti:proxy:ensure` at phase start when Graphiti is available
- `bun run config-sync:check`

## Required Search Audits

`ops/manifest.json` is authoritative for blocking search audits. The active
`P0` record currently lists all seven catalog families, so record:

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
- `missing-route-or-owner`
- `unowned-consumer-importer`
- `architecture-invalid-route`
- `required-command-failed`
- `worker-read-acknowledgment-missing`
- `required-search-audit-missing`
- `graphiti-obligation-unmet`
- `stale-evidence`
- `narrative-only-output`

## Exit Gate

P0 is complete when no active legacy surface lacks an owner, destination, or
migration batch, the consumer/importer census is explicit rather than inferred,
baseline audits are attached, baseline architecture and repo-law status is
recorded only after rereading the three governing standards, and the review
loop clears the artifact bundle.
