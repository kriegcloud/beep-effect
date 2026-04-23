# P1 Handoff - Program Controls, Ledgers, and Gate Templates

## Objective

Land the durable control-plane artifacts that every later execution phase
depends on: authoritative ledgers, gate templates, evidence-pack expectations,
and manifest-state rules.

## Dependencies

- P0 artifact bundle must exist and be trustworthy
- shared prompt layer: [../prompts/agent-prompts.md](../prompts/agent-prompts.md)
- prompt assets: [../prompt-assets/README.md](../prompt-assets/README.md)

## Required Inputs

- [SPEC.md](../../SPEC.md)
- [PLAN.md](../../PLAN.md)
- [../../history/outputs/p0-baseline-census-routing-canon-and-compliance-baseline.md](../../history/outputs/p0-baseline-census-routing-canon-and-compliance-baseline.md)
- [../../history/outputs/p0-consumer-importer-census.md](../../history/outputs/p0-consumer-importer-census.md)
- [../manifest.json](../manifest.json)

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

1. The compatibility ledger at `ops/compatibility-ledger.md`.
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
- `bun run audit:full`

## Required Search Audits

- compatibility aliases and temporary shims
- hard-coded app and script entrypoints
- touched package metadata for family and kind compliance

## Blocking Conditions

- `missing-source-artifact`
- `architecture-invalid-route`
- `ungoverned-temporary-exception`
- `required-search-audit-missing`
- `graphiti-obligation-unmet`

## Exit Gate

P1 is complete when every known temporary exception and constitution conflict
has a durable home, every later phase has a measurable gate definition, and no
phase can be closed on narrative output alone.
