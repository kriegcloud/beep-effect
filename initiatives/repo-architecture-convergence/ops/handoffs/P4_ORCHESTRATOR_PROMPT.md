# P4 Orchestrator Prompt

Load [../prompts/agent-prompts.md](../prompts/agent-prompts.md) and
[../prompt-assets/README.md](../prompt-assets/README.md) first.

## Phase Packet

- handoff: [HANDOFF_P4.md](./HANDOFF_P4.md)
- evidence pack:
  `history/outputs/p4-repo-memory-migration-and-validation.md`
- critique: `history/reviews/p4-critique.md`
- remediation: `history/reviews/p4-remediation.md`
- re-review: `history/reviews/p4-rereview.md`
- manifest: `ops/manifest.json`

## Required Outcomes

1. Land the `repo-memory` code moves and importer rewrites.
2. Land export rewrites, app-entrypoint rewrites, and compatibility deletions
   or governed shims.
3. Prove the canonical slice boundary decisions for the migrated batch.
4. Attach counts, exact searches, and command evidence for the live repo state.

## Required Commands

- `bun run graphiti:proxy:ensure` when available
- `bun run config-sync:check`
- `bun run check`
- `bun run lint`
- `bun run test`
- `bun run docgen`

## Completion Standard

P4 closes only when the landed `repo-memory` migration is in repo state, no
ungoverned importer remains on legacy paths, proof is replayable, and the
review loop clears the artifact bundle.
