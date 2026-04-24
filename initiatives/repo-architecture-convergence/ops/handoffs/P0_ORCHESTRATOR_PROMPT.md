# P0 Orchestrator Prompt

Follow the exact worker-read order and source-of-truth order from
[../../README.md](../../README.md), [../../SPEC.md](../../SPEC.md), and
[../manifest.json](../manifest.json). This prompt adds no new authority and
must not be loaded ahead of that contract. For this phase, reread
`standards/ARCHITECTURE.md`, `standards/effect-laws-v1.md`, and
`standards/effect-first-development.md` before recording baseline
architecture or repo-law status, and use the active phase's manifest record
for exact inputs, commands, search audits, and blocker ids.

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

1. Land the baseline census and route canon bundle, including the inventory and
   agent-runtime matrix inputs required for routed legacy roots.
2. Record explicit consumer/importer counts and ownership in
   `p0-consumer-importer-census.md`.
3. Attach the manifest-listed search-audit set for `P0`. At the current
   manifest version, that phase record lists all seven catalog families.
4. Record baseline architecture and repo-law status only after rereading the
   three governing standards.
5. Leave no legacy surface without an owner, destination, or amendment path.

## Required Commands

- `bun run graphiti:proxy:ensure` when available
- `bun run config-sync:check`

## Completion Standard

P0 closes only when the artifact bundle is current, the census is explicit,
baseline proof is replayable, baseline architecture and repo-law status cites
the governing-standards reread, and the review loop clears the result.
