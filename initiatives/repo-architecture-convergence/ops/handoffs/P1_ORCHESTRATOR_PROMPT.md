# P1 Orchestrator Prompt

Follow the exact worker-read order and source-of-truth order from
[../../README.md](../../README.md), [../../SPEC.md](../../SPEC.md), and
[../manifest.json](../manifest.json). This prompt adds no new authority and
must not be loaded ahead of that contract. Use the active `P1` manifest record
for exact inputs, commands, search audits, and blocker ids.

## Phase Packet

- handoff: [HANDOFF_P1.md](./HANDOFF_P1.md)
- evidence pack:
  `history/outputs/p1-program-controls-ledgers-and-gate-templates.md`
- durable output: `ops/compatibility-ledger.md`
- durable output: `ops/architecture-amendment-register.md`
- critique: `history/reviews/p1-critique.md`
- remediation: `history/reviews/p1-remediation.md`
- re-review: `history/reviews/p1-rereview.md`
- manifest: `ops/manifest.json`

## Required Outcomes

1. Land the authoritative ledger paths and template the compatibility ledger
   with the live closeout fields needed for canonical replacement, consumer,
   deletion-gate, validation-query, and allowlist proof.
2. Lock the exact gate stack, manifest-anchored search-audit contract, and
   evidence-pack expectations.
3. Lock manifest expectations for blockers, freshness, and review state.
4. Make later phases fail closed when they try to rely on narrative-only
   output.

## Required Commands

- `bun run graphiti:proxy:ensure` when available
- `bun run config-sync:check`

## Completion Standard

P1 closes only when the ledger paths, gate templates, and manifest rules are
authoritative and the review loop clears the artifact bundle.
