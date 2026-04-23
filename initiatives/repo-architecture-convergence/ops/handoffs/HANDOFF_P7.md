# P7 Handoff - Final Architecture and Repo-Law Verification

## Objective

Land the final verification bundle: architecture compliance matrix, repo-law
compliance matrix, final command-suite evidence, final search audits, and
closure of the compatibility ledger and architecture-amendment register.

## Dependencies

- P0 through P6 artifact bundles must exist and be trustworthy
- shared prompt layer: [../prompts/agent-prompts.md](../prompts/agent-prompts.md)
- prompt assets: [../prompt-assets/README.md](../prompt-assets/README.md)

## Required Inputs

- [SPEC.md](../../SPEC.md)
- [PLAN.md](../../PLAN.md)
- [design/verification-and-cutover.md](../../design/verification-and-cutover.md)
- all prior phase outputs under [../../history/outputs/](../../history/outputs)
- [../compatibility-ledger.md](../compatibility-ledger.md)
- [../architecture-amendment-register.md](../architecture-amendment-register.md)
- [../../standards/effect-laws.allowlist.jsonc](../../standards/effect-laws.allowlist.jsonc)
- [../manifest.json](../manifest.json)

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

- legacy topology references
- consumer/importer counts
- hard-coded app and script entrypoints
- canonical subpath and export usage
- compatibility aliases and temporary shims
- touched package metadata for family and kind compliance

## Blocking Conditions

- `ungoverned-temporary-exception`
- `required-command-failed`
- `required-search-audit-missing`
- `stale-evidence`
- `narrative-only-output`

## Exit Gate

P7 is complete only when every architecture-matrix row is `Compliant` or
resolved through an approved amendment already landed in the standards, every
repo-law row is `Compliant`, all required commands are green, no temporary
exception remains, and the review loop clears the final proof bundle.
