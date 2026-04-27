# P7 Orchestrator Prompt

Follow the exact worker-read order and source-of-truth order from
[../../README.md](../../README.md), [../../SPEC.md](../../SPEC.md), and
[../manifest.json](../manifest.json). This prompt adds no new authority and
must not be loaded ahead of that contract. For `P7`, use the exact phase
`inputs` from the manifest, including the enumerated prior phase outputs, and
immediately before matrix scoring or closure claims reread the three governing
standards plus `ops/compatibility-ledger.md` and
`ops/architecture-amendment-register.md`.

## Phase Packet

- handoff: [HANDOFF_P7.md](./HANDOFF_P7.md)
- evidence pack:
  `history/outputs/p7-final-architecture-and-repo-law-verification.md`
- durable output: `history/outputs/p7-architecture-compliance-matrix.md`
- durable output: `history/outputs/p7-repo-law-compliance-matrix.md`
- critique: `history/reviews/p7-critique.md`
- remediation: `history/reviews/p7-remediation.md`
- re-review: `history/reviews/p7-rereview.md`
- manifest: `ops/manifest.json`

## Required Outcomes

1. Land the final architecture compliance matrix and repo-law compliance matrix.
2. Land the final command-suite and the final manifest-listed search-audit
   proof bundle for `P7`, including the required repo-law boundary audits.
3. Close the compatibility ledger and amendment register.
4. Reopen the owning earlier phase for any implementation defect found here.

## Required Commands

- `bun run graphiti:proxy:ensure` when available
- `bun run config-sync:check`
- `bun run check`
- `bun run lint`
- `bun run test`
- `bun run docgen`
- `bun run audit:full`

## Completion Standard

P7 closes only when the final proof bundle is green, no temporary exception
remains, no new implementation work is being hidden in verification, and the
review loop clears the artifact bundle.
