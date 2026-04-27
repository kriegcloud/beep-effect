# P2 Handoff - Enablement and Wiring Cutover

## Objective

Land the repo-wide enablement changes that stop workspaces, scripts,
scaffolders, docgen, repo checks, tooling emitters, and app entrypoints from
recreating the legacy topology or treating legacy agent roots as canonical.

## Dependencies

- P0 and P1 artifact bundles must exist and be trustworthy
- shared prompt layer: [../prompts/agent-prompts.md](../prompts/agent-prompts.md)
- prompt assets: [../prompt-assets/README.md](../prompt-assets/README.md) plus
  the named asset files listed in the worker-read contract below

## Mandatory Worker-Read Contract

- Follow the exact worker-read order and source-of-truth order from
  `../../README.md`, `../../SPEC.md`, and `../manifest.json`. This handoff may
  add phase-local inputs, but it may not narrow or reorder that contract.

- Read `README.md`, `SPEC.md`, `PLAN.md`, `ops/README.md`,
  `ops/manifest.json`, `ops/handoffs/README.md`, this handoff,
  `ops/handoffs/P2_ORCHESTRATOR_PROMPT.md`, `history/quick-start.md`, and
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

- [design/current-state-routing-canon.md](../../design/current-state-routing-canon.md)
- [design/non-slice-family-migration.md](../../design/non-slice-family-migration.md)
- [design/tooling-and-agent-cutover.md](../../design/tooling-and-agent-cutover.md)
- [design/agent-runtime-decomposition-matrix.md](../../design/agent-runtime-decomposition-matrix.md)
- [../../history/outputs/p0-baseline-census-routing-canon-and-compliance-baseline.md](../../history/outputs/p0-baseline-census-routing-canon-and-compliance-baseline.md)
- [../../history/outputs/p1-program-controls-ledgers-and-gate-templates.md](../../history/outputs/p1-program-controls-ledgers-and-gate-templates.md)
- [../compatibility-ledger.md](../compatibility-ledger.md)
- [../architecture-amendment-register.md](../architecture-amendment-register.md)

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
4. Top-level app entrypoint, Layer-composition, and root config/task/watch
   rewrites that still encode legacy package homes or legacy agent roots such
   as `.agents`, `.aiassistant`, `.claude`, and `.codex` as canonical, plus
   any agent-root instruction or config cleanup needed to stay aligned with
   the authoritative lightweight/pathless `.aiassistant` rule.
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

`ops/manifest.json` is authoritative for blocking search audits. The active
`P2` record currently lists all seven catalog families, so record:

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

P2 is complete when the repo no longer regenerates the legacy topology through
workspaces, scaffolders, scripts, docgen, repo checks, app assembly, or root
config surfaces that still treat `.agents`, `.aiassistant`, `.claude`, or
`.codex` as canonical homes or violate the authoritative lightweight/pathless
agent-root rule, and the review loop clears the landed changes and proof.
