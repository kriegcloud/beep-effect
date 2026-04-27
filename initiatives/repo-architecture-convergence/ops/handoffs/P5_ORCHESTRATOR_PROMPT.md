# P5 Orchestrator Prompt

Follow the exact worker-read order and source-of-truth order from
[../../README.md](../../README.md), [../../SPEC.md](../../SPEC.md), and
[../manifest.json](../manifest.json). This prompt adds no new authority and
must not be loaded ahead of that contract. For `P5`, read the three governing
standards before edits or gate interpretation, and use the active manifest
record for exact inputs, commands, search audits, and blocker ids.

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
4. Attach counts, the manifest-listed search-audit set for `P5`, and command
   evidence for the live repo state.

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

P5 closes only when the landed `editor` migration is in repo state, no
ungoverned importer remains on legacy paths, proof is replayable, and the
review loop clears the artifact bundle.
