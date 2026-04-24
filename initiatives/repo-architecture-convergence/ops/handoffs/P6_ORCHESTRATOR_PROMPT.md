# P6 Orchestrator Prompt

Follow the exact worker-read order and source-of-truth order from
[../../README.md](../../README.md), [../../SPEC.md](../../SPEC.md), and
[../manifest.json](../manifest.json). This prompt adds no new authority and
must not be loaded ahead of that contract. For `P6`, read the three governing
standards before edits or gate interpretation, and use the active manifest
record for exact inputs, commands, search audits, and blocker ids.

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
2. Move agent bundles out of `.agents`, `.aiassistant`, `.claude`, and
   `.codex` into the canonical agent destinations defined by the live routing
   packet or tooling-owned destinations, while keeping agent-instruction text
   lightweight and pathless where the authoritative `.aiassistant` rule
   requires it.
3. Leave runtime adapters declarative and move executable logic into tooling
   packages.
4. Delete or govern the final compatibility surfaces and attach the
   manifest-listed search-audit set for `P6` plus command proof.

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
