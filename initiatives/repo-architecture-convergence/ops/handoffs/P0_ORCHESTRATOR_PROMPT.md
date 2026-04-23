# P0 Orchestrator Prompt

Load [../prompts/agent-prompts.md](../prompts/agent-prompts.md) and
[../prompt-assets/README.md](../prompt-assets/README.md) first.

## Phase Packet

- handoff: [HANDOFF_P0.md](./HANDOFF_P0.md)
- evidence pack:
  `history/outputs/p0-baseline-census-routing-canon-and-compliance-baseline.md`
- durable output: `history/outputs/p0-consumer-importer-census.md`
- critique: `history/reviews/p0-critique.md`
- remediation: `history/reviews/p0-remediation.md`
- re-review: `history/reviews/p0-rereview.md`
- manifest: `ops/manifest.json`

## Required Outcomes

1. Land the baseline census and route canon bundle.
2. Record explicit consumer/importer counts and ownership in
   `p0-consumer-importer-census.md`.
3. Attach baseline search audits and command proof.
4. Leave no legacy surface without an owner, destination, or amendment path.

## Required Commands

- `bun run graphiti:proxy:ensure` when available
- `bun run config-sync:check`
- `bun run audit:full`

## Completion Standard

P0 closes only when the artifact bundle is current, the census is explicit,
baseline proof is replayable, and the review loop clears the result.
