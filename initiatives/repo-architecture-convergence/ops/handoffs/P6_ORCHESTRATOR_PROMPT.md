# P6 Orchestrator Prompt

Load [../prompts/agent-prompts.md](../prompts/agent-prompts.md) and
[../prompt-assets/README.md](../prompt-assets/README.md) first.

## Phase Packet

- handoff: [HANDOFF_P6.md](./HANDOFF_P6.md)
- evidence pack:
  `history/outputs/p6-operational-app-agent-cutovers-and-compatibility-deletion.md`
- critique: `history/reviews/p6-critique.md`
- remediation: `history/reviews/p6-remediation.md`
- re-review: `history/reviews/p6-rereview.md`
- manifest: `ops/manifest.json`

## Required Outcomes

1. Land the remaining operational, app, and agent cutovers.
2. Move agent bundles into `agents/<kind>/<name>`.
3. Leave runtime adapters declarative and move executable logic into tooling
   packages.
4. Delete or govern the final compatibility surfaces and attach proof.

## Required Commands

- `bun run graphiti:proxy:ensure` when available
- `bun run config-sync:check`
- `bun run check`
- `bun run lint`
- `bun run test`
- `bun run docgen`
- `bun run audit:full`

## Completion Standard

P6 closes only when the landed cutover removes live dependence on the legacy
topology, the compatibility ledger is effectively closed, proof is replayable,
and the review loop clears the artifact bundle.
