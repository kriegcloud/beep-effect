# P0 Handoff - Baseline Census, Routing Canon, and Compliance Baseline

## Objective

Land the baseline census bundle and proof needed to start executed migration
work. P0 closes on explicit census data, route ownership, and baseline proof,
not on high-level planning language.

## Dependencies

- none
- shared prompt layer: [../prompts/agent-prompts.md](../prompts/agent-prompts.md)
- prompt assets: [../prompt-assets/README.md](../prompt-assets/README.md)

## Required Inputs

- [SPEC.md](../../SPEC.md)
- [PLAN.md](../../PLAN.md)
- [design/current-state-routing-canon.md](../../design/current-state-routing-canon.md)
- [design/non-slice-family-migration.md](../../design/non-slice-family-migration.md)
- [../manifest.json](../manifest.json)

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
3. A route canon that assigns every legacy surface to a target package or an
   amendment candidate.
4. Baseline status for the architecture and repo-law matrices.
5. Explicit downstream phase dependencies and migration-batch ownership.

## Required Command Gates

- `bun run graphiti:proxy:ensure` at phase start when Graphiti is available
- `bun run config-sync:check`
- `bun run audit:full`

## Required Search Audits

- legacy topology references
- consumer/importer counts
- hard-coded app and script entrypoints

## Blocking Conditions

- `missing-source-artifact`
- `missing-route-or-owner`
- `unowned-consumer-importer`
- `architecture-invalid-route`
- `required-search-audit-missing`

## Exit Gate

P0 is complete when no active legacy surface lacks an owner, destination, or
migration batch, the consumer/importer census is explicit rather than inferred,
baseline audits are attached, and the review loop clears the artifact bundle.
