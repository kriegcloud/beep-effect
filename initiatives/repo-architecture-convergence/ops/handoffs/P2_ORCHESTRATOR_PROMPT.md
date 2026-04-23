# P2 Orchestrator Prompt

Load [../prompts/agent-prompts.md](../prompts/agent-prompts.md) and
[../prompt-assets/README.md](../prompt-assets/README.md) first.

## Phase Packet

- handoff: [HANDOFF_P2.md](./HANDOFF_P2.md)
- evidence pack: `history/outputs/p2-enablement-and-wiring-cutover.md`
- critique: `history/reviews/p2-critique.md`
- remediation: `history/reviews/p2-remediation.md`
- re-review: `history/reviews/p2-rereview.md`
- manifest: `ops/manifest.json`

## Required Outcomes

1. Land the enablement and wiring changes that make the target topology the
   repo's only source of truth.
2. Rewire workspaces, aliases, scripts, scaffolders, docgen, repo checks, and
   app entrypoints.
3. Delete or govern any remaining compatibility bridge.
4. Attach the exact commands and search audits that prove the legacy topology
   is no longer emitted.

## Required Commands

- `bun run graphiti:proxy:ensure` when available
- `bun run config-sync:check`
- `bun run check`
- `bun run lint`
- `bun run test`
- `bun run docgen`
- `bun run audit:full`

## Completion Standard

P2 closes only when the landed repo changes stop regenerating the old
topology, proof is replayable, and the review loop clears the cutover.
