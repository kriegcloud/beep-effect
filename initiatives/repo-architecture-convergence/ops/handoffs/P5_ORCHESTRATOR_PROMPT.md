# P5 Orchestrator Prompt

Load [../prompts/agent-prompts.md](../prompts/agent-prompts.md) and
[../prompt-assets/README.md](../prompt-assets/README.md) first.

## Phase Packet

- handoff: [HANDOFF_P5.md](./HANDOFF_P5.md)
- evidence pack: `history/outputs/p5-editor-migration-and-validation.md`
- critique: `history/reviews/p5-critique.md`
- remediation: `history/reviews/p5-remediation.md`
- re-review: `history/reviews/p5-rereview.md`
- manifest: `ops/manifest.json`

## Required Outcomes

1. Land the `editor` code moves and importer rewrites.
2. Land the `client` versus `ui` split for `editor/lexical` plus any required
   extraction work.
3. Land export rewrites, app-entrypoint rewrites, and compatibility cleanup.
4. Attach counts, exact searches, and command evidence for the live repo state.

## Required Commands

- `bun run graphiti:proxy:ensure` when available
- `bun run config-sync:check`
- `bun run check`
- `bun run lint`
- `bun run test`
- `bun run docgen`

## Completion Standard

P5 closes only when the landed `editor` migration is in repo state, no
ungoverned importer remains on legacy paths, proof is replayable, and the
review loop clears the artifact bundle.
