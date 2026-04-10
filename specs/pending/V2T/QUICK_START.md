# V2T Canonical Spec - Quick Start

## Fresh Session Flow

1. Read [README.md](./README.md).
2. Read [outputs/manifest.json](./outputs/manifest.json) and trust `active_phase`.
3. Read [outputs/grill-log.md](./outputs/grill-log.md) for locked package-shape decisions.
4. Open the active phase handoff from `handoffs/`.
5. Read prior phase artifacts that constrain the active phase.
6. Execute only the active phase and stop at its exit gate.
7. Update the active phase artifact and [outputs/manifest.json](./outputs/manifest.json) before exiting.

## Phase Table

| Phase | Handoff | Prompt | Artifact |
|---|---|---|---|
| P0 | [HANDOFF_P0.md](./handoffs/HANDOFF_P0.md) | [P0_ORCHESTRATOR_PROMPT.md](./handoffs/P0_ORCHESTRATOR_PROMPT.md) | [RESEARCH.md](./RESEARCH.md) |
| P1 | [HANDOFF_P1.md](./handoffs/HANDOFF_P1.md) | [P1_ORCHESTRATOR_PROMPT.md](./handoffs/P1_ORCHESTRATOR_PROMPT.md) | [DESIGN_RESEARCH.md](./DESIGN_RESEARCH.md) |
| P2 | [HANDOFF_P2.md](./handoffs/HANDOFF_P2.md) | [P2_ORCHESTRATOR_PROMPT.md](./handoffs/P2_ORCHESTRATOR_PROMPT.md) | [PLANNING.md](./PLANNING.md) |
| P3 | [HANDOFF_P3.md](./handoffs/HANDOFF_P3.md) | [P3_ORCHESTRATOR_PROMPT.md](./handoffs/P3_ORCHESTRATOR_PROMPT.md) | [EXECUTION.md](./EXECUTION.md) |
| P4 | [HANDOFF_P4.md](./handoffs/HANDOFF_P4.md) | [P4_ORCHESTRATOR_PROMPT.md](./handoffs/P4_ORCHESTRATOR_PROMPT.md) | [VERIFICATION.md](./VERIFICATION.md) |

## Active Inputs

- [outputs/v2t_app_notes.html](./outputs/v2t_app_notes.html)
- [outputs/V2_animination_V2T.md](./outputs/V2_animination_V2T.md)
- `apps/V2T`
- shared UI speech input in `packages/common/ui/src/components/speech-input.tsx`
- root Graphiti commands and proxy tooling

## Default Starting Point

Unless a stronger user instruction overrides it, the package assumes the first implementation slice should convert the existing `apps/V2T` shell into a local-first workspace that can:

- capture or ingest a conversation
- create structured transcript/session artifacts
- retrieve memory context through an explicit adapter seam
- configure a composition run
- produce export-ready composition packets and artifact records
