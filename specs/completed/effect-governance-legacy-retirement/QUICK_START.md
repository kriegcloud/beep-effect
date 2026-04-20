# Effect Governance Legacy Retirement - Quick Start

## Fresh Session

1. Read [outputs/manifest.json](./outputs/manifest.json).
2. Read [outputs/grill-log.md](./outputs/grill-log.md).
3. Read [README.md](./README.md).
4. Read [AGENT_PROMPTS.md](./AGENT_PROMPTS.md).
5. Read the active phase handoff and active phase orchestrator prompt from the manifest.

## Phase Table

| Phase | Goal | Handoff | Prompt | Output |
|---|---|---|---|---|
| P0 | inventory the remaining legacy surface | [handoffs/HANDOFF_P0.md](./handoffs/HANDOFF_P0.md) | [handoffs/P0_ORCHESTRATOR_PROMPT.md](./handoffs/P0_ORCHESTRATOR_PROMPT.md) | [RESEARCH.md](./RESEARCH.md) |
| P1 | validate and narrow retirement options | [handoffs/HANDOFF_P1.md](./handoffs/HANDOFF_P1.md) | [handoffs/P1_ORCHESTRATOR_PROMPT.md](./handoffs/P1_ORCHESTRATOR_PROMPT.md) | [VALIDATED_OPTIONS.md](./VALIDATED_OPTIONS.md) |
| P2 | produce the ranked retirement plan | [handoffs/HANDOFF_P2.md](./handoffs/HANDOFF_P2.md) | [handoffs/P2_ORCHESTRATOR_PROMPT.md](./handoffs/P2_ORCHESTRATOR_PROMPT.md) | [PLANNING.md](./PLANNING.md) |
| P3 | implement the chosen retirement path | [handoffs/HANDOFF_P3.md](./handoffs/HANDOFF_P3.md) | [handoffs/P3_ORCHESTRATOR_PROMPT.md](./handoffs/P3_ORCHESTRATOR_PROMPT.md) | [EXECUTION.md](./EXECUTION.md) |
| P4 | verify retirement and docs-lane safety | [handoffs/HANDOFF_P4.md](./handoffs/HANDOFF_P4.md) | [handoffs/P4_ORCHESTRATOR_PROMPT.md](./handoffs/P4_ORCHESTRATOR_PROMPT.md) | [VERIFICATION.md](./VERIFICATION.md) |

## Combined Router

- [handoffs/HANDOFF_P0-P4.md](./handoffs/HANDOFF_P0-P4.md)
- [handoffs/P0-P4_ORCHESTRATOR_PROMPT.md](./handoffs/P0-P4_ORCHESTRATOR_PROMPT.md)

Use the combined pair for a fresh Codex session that needs to orient itself before dropping into the active phase.

## Non-Negotiables

- P0, P1, and P2 are read-only outside this spec package.
- Keep the Effect lane separate from the JSDoc and TSDoc lane.
- Do not assume repo-wide ESLint removal is required for success.
- P1 must lock the inventory and remove-or-retain matrix.
- P2 must choose one retirement posture rather than carry multiple primaries forward.
- P4 must evaluate retirement, docs-lane safety, and dependency or performance evidence.
