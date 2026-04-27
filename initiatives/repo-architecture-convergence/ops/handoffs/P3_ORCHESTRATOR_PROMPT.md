# P3 Orchestrator Prompt

Follow the exact worker-read order and source-of-truth order from
[../../README.md](../../README.md), [../../SPEC.md](../../SPEC.md), and
[../manifest.json](../manifest.json). This prompt adds no new authority and
must not be loaded ahead of that contract. For `P3`, read the three governing
standards before edits or gate interpretation, and use the active manifest
record for exact inputs, commands, search audits, and blocker ids.

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
4. Attach counts, the manifest-listed search-audit set for `P3`, and ledger
   deltas for the moved batch.

## Required Commands

- `bun run graphiti:proxy:ensure` when available
- `bun run config-sync:check`
- `bun run check`
- `bun run lint`
- `bun run test`
- `bun run docgen`
- `bun run audit:full` when the batch touches tooling, config, routing, or
  generators, or record an explicit out-of-scope reason

## Completion Standard

P3 closes only when the landed extraction work is present, retained shared
surfaces are legal or governed, proof is replayable, and the review loop
clears the artifact bundle.
