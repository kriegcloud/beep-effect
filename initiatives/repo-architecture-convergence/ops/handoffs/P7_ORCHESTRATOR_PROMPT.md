# P7 Orchestrator Prompt

Load [../prompts/agent-prompts.md](../prompts/agent-prompts.md) and
[../prompt-assets/README.md](../prompt-assets/README.md) first.

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
2. Land the final command-suite and search-audit proof bundle.
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
