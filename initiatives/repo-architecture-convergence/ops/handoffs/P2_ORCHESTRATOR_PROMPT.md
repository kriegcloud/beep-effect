# P2 Orchestrator Prompt

Follow the exact worker-read order and source-of-truth order from
[../../README.md](../../README.md), [../../SPEC.md](../../SPEC.md), and
[../manifest.json](../manifest.json). This prompt adds no new authority and
must not be loaded ahead of that contract. For `P2`, read the three governing
standards before edits or gate interpretation, and use the active manifest
record for exact inputs, commands, search audits, and blocker ids.

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
2. Rewire workspaces, aliases, scripts, scaffolders, docgen, repo checks, app
   entrypoints, and root config/task/watch surfaces that still treat `.agents`,
   `.aiassistant`, `.claude`, or `.codex` as canonical or that violate the
   authoritative lightweight/pathless `.aiassistant` rule.
3. Delete or govern any remaining compatibility bridge.
4. Attach the exact commands and the manifest-listed search-audit set for `P2`
   that prove the legacy topology is no longer emitted.

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
