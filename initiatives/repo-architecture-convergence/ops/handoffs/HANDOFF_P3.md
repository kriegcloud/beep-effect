# P3 Handoff - Shared-Kernel and Non-Slice Extraction

## Objective

Land the shared-kernel contraction and non-slice extraction work that moves
domain-agnostic substrate into `foundation`, technical boundary wrappers into
`drivers`, and leaves `shared/*` as deliberate shared-kernel language only.

## Dependencies

- P0, P1, and P2 artifact bundles must exist and be trustworthy
- shared prompt layer: [../prompts/agent-prompts.md](../prompts/agent-prompts.md)
- prompt assets: [../prompt-assets/README.md](../prompt-assets/README.md)

## Required Inputs

- [SPEC.md](../../SPEC.md)
- [PLAN.md](../../PLAN.md)
- [design/shared-kernel-contraction.md](../../design/shared-kernel-contraction.md)
- [design/current-state-routing-canon.md](../../design/current-state-routing-canon.md)
- [../../history/outputs/p0-baseline-census-routing-canon-and-compliance-baseline.md](../../history/outputs/p0-baseline-census-routing-canon-and-compliance-baseline.md)
- [../../history/outputs/p1-program-controls-ledgers-and-gate-templates.md](../../history/outputs/p1-program-controls-ledgers-and-gate-templates.md)
- [../../history/outputs/p2-enablement-and-wiring-cutover.md](../../history/outputs/p2-enablement-and-wiring-cutover.md)
- [../compatibility-ledger.md](../compatibility-ledger.md)
- [../architecture-amendment-register.md](../architecture-amendment-register.md)
- [../manifest.json](../manifest.json)

## Required Artifact Bundle

- evidence pack:
  `history/outputs/p3-shared-kernel-and-non-slice-extraction.md`
- critique: `history/reviews/p3-critique.md`
- remediation: `history/reviews/p3-remediation.md`
- re-review: `history/reviews/p3-rereview.md`
- manifest: `ops/manifest.json`

## Must Land

1. Actual extraction work that moves domain-agnostic substrate into
   `foundation`.
2. Actual extraction work that moves technical boundary wrappers into
   `drivers`.
3. Actual contraction work that leaves `shared/*` with deliberate shared-kernel
   language only.
4. Importer rewires and compatibility updates for every moved batch.
5. Governed provisional handling for any retained `shared/*` surface that still
   needs later slice proof.

## Required Command Gates

- `bun run graphiti:proxy:ensure` at phase start when Graphiti is available
- `bun run config-sync:check`
- `bun run check`
- `bun run lint`
- `bun run test`
- `bun run docgen`

## Required Search Audits

- legacy topology references
- consumer/importer counts
- canonical subpath and export usage
- compatibility aliases and temporary shims
- touched package metadata for family and kind compliance

## Blocking Conditions

- `missing-route-or-owner`
- `unowned-consumer-importer`
- `architecture-invalid-route`
- `ungoverned-temporary-exception`
- `required-command-failed`
- `narrative-only-output`

## Exit Gate

P3 is complete when every retained `shared/*` package is architecture-legal or
governed as a temporary exception with owner and due phase, mixed packages are
split or blocked explicitly, and the review loop clears the extraction proof.
