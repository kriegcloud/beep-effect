# P2 Handoff - Enablement and Wiring Cutover

## Objective

Land the repo-wide enablement changes that stop workspaces, scripts,
scaffolders, docgen, repo checks, tooling emitters, and app entrypoints from
recreating the legacy topology.

## Dependencies

- P0 and P1 artifact bundles must exist and be trustworthy
- shared prompt layer: [../prompts/agent-prompts.md](../prompts/agent-prompts.md)
- prompt assets: [../prompt-assets/README.md](../prompt-assets/README.md)

## Required Inputs

- [SPEC.md](../../SPEC.md)
- [PLAN.md](../../PLAN.md)
- [design/current-state-routing-canon.md](../../design/current-state-routing-canon.md)
- [design/non-slice-family-migration.md](../../design/non-slice-family-migration.md)
- [design/tooling-and-agent-cutover.md](../../design/tooling-and-agent-cutover.md)
- [../../history/outputs/p0-baseline-census-routing-canon-and-compliance-baseline.md](../../history/outputs/p0-baseline-census-routing-canon-and-compliance-baseline.md)
- [../../history/outputs/p1-program-controls-ledgers-and-gate-templates.md](../../history/outputs/p1-program-controls-ledgers-and-gate-templates.md)
- [../compatibility-ledger.md](../compatibility-ledger.md)
- [../architecture-amendment-register.md](../architecture-amendment-register.md)
- [../manifest.json](../manifest.json)

## Required Artifact Bundle

- evidence pack: `history/outputs/p2-enablement-and-wiring-cutover.md`
- critique: `history/reviews/p2-critique.md`
- remediation: `history/reviews/p2-remediation.md`
- re-review: `history/reviews/p2-rereview.md`
- manifest: `ops/manifest.json`

## Must Land

1. Workspace-glob and workspace-package updates that point at canonical homes.
2. Alias, path-map, config-sync, scaffolder, and generator rewrites.
3. Docgen, repo-check, tooling-emitter, script-target, filter, and hard-coded
   package-path rewrites.
4. Top-level app entrypoint and Layer-composition rewrites that still encode
   legacy package homes.
5. Compatibility deletions or governed temporary exceptions for any remaining
   enablement bridge.

## Required Command Gates

- `bun run graphiti:proxy:ensure` at phase start when Graphiti is available
- `bun run config-sync:check`
- `bun run check`
- `bun run lint`
- `bun run test`
- `bun run docgen`
- `bun run audit:full`

## Required Search Audits

- legacy topology references
- hard-coded app and script entrypoints
- compatibility aliases and temporary shims
- touched package metadata for family and kind compliance

## Blocking Conditions

- `missing-route-or-owner`
- `architecture-invalid-route`
- `ungoverned-temporary-exception`
- `required-command-failed`
- `required-search-audit-missing`
- `narrative-only-output`

## Exit Gate

P2 is complete when the repo no longer regenerates the legacy topology through
workspaces, scaffolders, scripts, docgen, repo checks, or app assembly, and
the review loop clears the landed changes and proof.
