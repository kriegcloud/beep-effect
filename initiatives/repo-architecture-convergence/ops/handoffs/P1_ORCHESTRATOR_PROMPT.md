# P1 Orchestrator Prompt

Load [../prompts/agent-prompts.md](../prompts/agent-prompts.md) and
[../prompt-assets/README.md](../prompt-assets/README.md) first.

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

1. Land the authoritative ledger paths and template them for active execution.
2. Lock the exact gate stack, search-audit rules, and evidence-pack contract.
3. Lock manifest expectations for blockers, freshness, and review state.
4. Make later phases fail closed when they try to rely on narrative-only
   output.

## Required Commands

- `bun run graphiti:proxy:ensure` when available
- `bun run config-sync:check`
- `bun run audit:full`

## Completion Standard

P1 closes only when the ledger paths, gate templates, and manifest rules are
authoritative and the review loop clears the artifact bundle.
