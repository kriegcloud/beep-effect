# P7 Handoff - Final Architecture and Repo-Law Verification

## Objective

Land the final verification bundle: architecture compliance matrix, repo-law
compliance matrix, final command-suite evidence, final search audits, and
closure of the compatibility ledger and architecture-amendment register.

## Dependencies

- P0 through P6 artifact bundles must exist and be trustworthy
- shared prompt layer: [../prompts/agent-prompts.md](../prompts/agent-prompts.md)
- prompt assets: [../prompt-assets/README.md](../prompt-assets/README.md) plus
  the named asset files listed in the worker-read contract below

## Mandatory Worker-Read Contract

- Follow the exact worker-read order and source-of-truth order from
  `../../README.md`, `../../SPEC.md`, and `../manifest.json`. This handoff may
  add phase-local inputs, but it may not narrow or reorder that contract.

- Read `README.md`, `SPEC.md`, `PLAN.md`, `ops/README.md`,
  `ops/manifest.json`, `ops/handoffs/README.md`, this handoff,
  `ops/handoffs/P7_ORCHESTRATOR_PROMPT.md`, `history/quick-start.md`, and
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
- Immediately before matrix scoring or closure claims, reread those three
  standards plus `ops/compatibility-ledger.md` and
  `ops/architecture-amendment-register.md`, and record that immediate reread
  in the evidence pack before scoring proceeds.

## Phase-Specific Supporting Inputs

- [design/verification-and-cutover.md](../../design/verification-and-cutover.md)
- [../../history/outputs/p0-baseline-census-routing-canon-and-compliance-baseline.md](../../history/outputs/p0-baseline-census-routing-canon-and-compliance-baseline.md)
- [../../history/outputs/p0-consumer-importer-census.md](../../history/outputs/p0-consumer-importer-census.md)
- [../../history/outputs/p1-program-controls-ledgers-and-gate-templates.md](../../history/outputs/p1-program-controls-ledgers-and-gate-templates.md)
- [../../history/outputs/p2-enablement-and-wiring-cutover.md](../../history/outputs/p2-enablement-and-wiring-cutover.md)
- [../../history/outputs/p3-shared-kernel-and-non-slice-extraction.md](../../history/outputs/p3-shared-kernel-and-non-slice-extraction.md)
- [../../history/outputs/p4-repo-memory-migration-and-validation.md](../../history/outputs/p4-repo-memory-migration-and-validation.md)
- [../../history/outputs/p5-editor-migration-and-validation.md](../../history/outputs/p5-editor-migration-and-validation.md)
- [../../history/outputs/p6-operational-app-agent-cutovers-and-compatibility-deletion.md](../../history/outputs/p6-operational-app-agent-cutovers-and-compatibility-deletion.md)
- [../compatibility-ledger.md](../compatibility-ledger.md)
- [../architecture-amendment-register.md](../architecture-amendment-register.md)
- [../../../../standards/effect-laws.allowlist.jsonc](../../../../standards/effect-laws.allowlist.jsonc)

## Required Artifact Bundle

- evidence pack:
  `history/outputs/p7-final-architecture-and-repo-law-verification.md`
- durable output: `history/outputs/p7-architecture-compliance-matrix.md`
- durable output: `history/outputs/p7-repo-law-compliance-matrix.md`
- critique: `history/reviews/p7-critique.md`
- remediation: `history/reviews/p7-remediation.md`
- re-review: `history/reviews/p7-rereview.md`
- manifest: `ops/manifest.json`

## Must Land

1. The final architecture compliance matrix with proof links and command
   evidence for every row.
2. The final repo-law compliance matrix with allowlist references and command
   evidence for every row.
3. Final command-suite evidence and final search-audit evidence.
4. Closure of `ops/compatibility-ledger.md` and
   `ops/architecture-amendment-register.md`.
5. Any failure routed back to the owning earlier phase instead of being
   absorbed here as new implementation work.

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
`P7` record currently lists all seven catalog families, so record:

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

P7 is complete only when every architecture-matrix row is `Compliant` or
resolved through an approved amendment already landed in the standards, every
repo-law row is `Compliant`, all required commands are green, no temporary
exception remains, the immediate reread is recorded before scoring, and the
review loop clears the final proof bundle.
