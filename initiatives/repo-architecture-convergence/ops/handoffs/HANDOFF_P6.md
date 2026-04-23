# P6 Handoff - Remaining Operational, App, and Agent Cutovers Plus Compatibility Deletion

## Objective

Land the remaining operational package moves, agent bundle relocation,
runtime-adapter cleanup, final app-consumer rewires, canonical subpath
completion, and compatibility deletions that depend on earlier slice evidence.

## Dependencies

- P0 through P5 artifact bundles must exist and be trustworthy
- shared prompt layer: [../prompts/agent-prompts.md](../prompts/agent-prompts.md)
- prompt assets: [../prompt-assets/README.md](../prompt-assets/README.md)

## Required Inputs

- [SPEC.md](../../SPEC.md)
- [PLAN.md](../../PLAN.md)
- [design/non-slice-family-migration.md](../../design/non-slice-family-migration.md)
- [design/tooling-and-agent-cutover.md](../../design/tooling-and-agent-cutover.md)
- [../../history/outputs/p0-baseline-census-routing-canon-and-compliance-baseline.md](../../history/outputs/p0-baseline-census-routing-canon-and-compliance-baseline.md)
- [../../history/outputs/p1-program-controls-ledgers-and-gate-templates.md](../../history/outputs/p1-program-controls-ledgers-and-gate-templates.md)
- [../../history/outputs/p2-enablement-and-wiring-cutover.md](../../history/outputs/p2-enablement-and-wiring-cutover.md)
- [../../history/outputs/p3-shared-kernel-and-non-slice-extraction.md](../../history/outputs/p3-shared-kernel-and-non-slice-extraction.md)
- [../../history/outputs/p4-repo-memory-migration-and-validation.md](../../history/outputs/p4-repo-memory-migration-and-validation.md)
- [../../history/outputs/p5-editor-migration-and-validation.md](../../history/outputs/p5-editor-migration-and-validation.md)
- [../compatibility-ledger.md](../compatibility-ledger.md)
- [../architecture-amendment-register.md](../architecture-amendment-register.md)
- [../manifest.json](../manifest.json)

## Required Artifact Bundle

- evidence pack:
  `history/outputs/p6-operational-app-agent-cutovers-and-compatibility-deletion.md`
- critique: `history/reviews/p6-critique.md`
- remediation: `history/reviews/p6-remediation.md`
- re-review: `history/reviews/p6-rereview.md`
- manifest: `ops/manifest.json`

## Must Land

1. Remaining operational package moves that depend on slice evidence.
2. Agent bundle relocation into `agents/<kind>/<name>`.
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

- legacy topology references
- hard-coded app and script entrypoints
- canonical subpath and export usage
- compatibility aliases and temporary shims
- touched package metadata for family and kind compliance

## Blocking Conditions

- `architecture-invalid-route`
- `ungoverned-temporary-exception`
- `required-command-failed`
- `required-search-audit-missing`
- `narrative-only-output`

## Exit Gate

P6 is complete when no live app, agent, or tooling path depends on the legacy
topology, the compatibility ledger is empty or contains only the blocking issue
being resolved in the same phase, runtime adapters are declarative, and the
review loop clears the landed cutover.
