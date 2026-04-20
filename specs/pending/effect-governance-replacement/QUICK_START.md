# Effect Governance Replacement - Quick Start

## Fresh Session

1. Read [outputs/manifest.json](./outputs/manifest.json).
2. Read [outputs/grill-log.md](./outputs/grill-log.md).
3. Read [README.md](./README.md).
4. Read [AGENT_PROMPTS.md](./AGENT_PROMPTS.md).
5. Read the active phase handoff and active phase orchestrator prompt from the manifest.

## Phase Table

| Phase | Goal | Handoff | Prompt | Output |
|---|---|---|---|---|
| P0 | research the replacement landscape | [handoffs/HANDOFF_P0.md](./handoffs/HANDOFF_P0.md) | [handoffs/P0_ORCHESTRATOR_PROMPT.md](./handoffs/P0_ORCHESTRATOR_PROMPT.md) | [RESEARCH.md](./RESEARCH.md) |
| P1 | validate and narrow the candidate set | [handoffs/HANDOFF_P1.md](./handoffs/HANDOFF_P1.md) | [handoffs/P1_ORCHESTRATOR_PROMPT.md](./handoffs/P1_ORCHESTRATOR_PROMPT.md) | [VALIDATED_OPTIONS.md](./VALIDATED_OPTIONS.md) |
| P2 | produce the ranked implementation plan | [handoffs/HANDOFF_P2.md](./handoffs/HANDOFF_P2.md) | [handoffs/P2_ORCHESTRATOR_PROMPT.md](./handoffs/P2_ORCHESTRATOR_PROMPT.md) | [PLANNING.md](./PLANNING.md) |
| P3 | implement the chosen path | [handoffs/HANDOFF_P3.md](./handoffs/HANDOFF_P3.md) | [handoffs/P3_ORCHESTRATOR_PROMPT.md](./handoffs/P3_ORCHESTRATOR_PROMPT.md) | [EXECUTION.md](./EXECUTION.md) |
| P4 | verify parity, performance, and steering | [handoffs/HANDOFF_P4.md](./handoffs/HANDOFF_P4.md) | [handoffs/P4_ORCHESTRATOR_PROMPT.md](./handoffs/P4_ORCHESTRATOR_PROMPT.md) | [VERIFICATION.md](./VERIFICATION.md) |

## Combined Router

- [handoffs/HANDOFF_P0-P4.md](./handoffs/HANDOFF_P0-P4.md)
- [handoffs/P0-P4_ORCHESTRATOR_PROMPT.md](./handoffs/P0-P4_ORCHESTRATOR_PROMPT.md)

Use the combined pair for a fresh Codex session that needs to orient itself before dropping into the active phase.

## Non-Negotiables

- P0, P1, and P2 are read-only outside this spec package.
- P1 must lock the fixed steering evaluation corpus.
- P2 must produce a ranked plan rather than another idea list.
- P3 must implement only the chosen primary path plus strictly necessary glue.
- P4 must evaluate parity, performance, and steering on the fixed corpus.

## Recommended Operator Flow

1. Start at P0 unless the manifest already points at a later phase.
2. Use parallel workers only after the orchestrator forms a local plan.
3. Keep the JSDoc and TSDoc lane separate from the Effect replacement lane.
4. Prefer primary sources for capability or performance claims.
5. Permit `full replacement`, `staged cutover`, or `no-go yet` if the evidence requires it.
