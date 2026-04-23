# P3 Orchestrator Prompt

Load [../prompts/agent-prompts.md](../prompts/agent-prompts.md) and
[../prompt-assets/README.md](../prompt-assets/README.md) first.

## Phase Packet

- handoff: [HANDOFF_P3.md](./HANDOFF_P3.md)
- evidence pack:
  `history/outputs/p3-shared-kernel-and-non-slice-extraction.md`
- critique: `history/reviews/p3-critique.md`
- remediation: `history/reviews/p3-remediation.md`
- re-review: `history/reviews/p3-rereview.md`
- manifest: `ops/manifest.json`

## Required Outcomes

1. Land the extraction work into `foundation` and `drivers`.
2. Contract `shared/*` to deliberate shared-kernel language only.
3. Rewire importers and govern any still-temporary retained surfaces.
4. Attach counts, search audits, and ledger deltas for the moved batch.

## Required Commands

- `bun run graphiti:proxy:ensure` when available
- `bun run config-sync:check`
- `bun run check`
- `bun run lint`
- `bun run test`
- `bun run docgen`

## Completion Standard

P3 closes only when the landed extraction work is present, retained shared
surfaces are legal or governed, proof is replayable, and the review loop
clears the artifact bundle.
