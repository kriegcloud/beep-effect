# P0-P4 Handoff - `V2T`

## Objective

Carry the V2T canonical spec through the P0-P4 sequence without reopening locked package-shape decisions unless conflicting repo evidence requires it.

## Mode Handling

If you are operating in Plan Mode, do not edit spec artifacts yet. First read the required inputs, confirm which defaults are already locked, resolve remaining ambiguities through non-mutating exploration, and produce a decision-complete phase plan. Only write or refine the current phase output artifact when operating outside Plan Mode.

## Required Read Order

1. [README.md](../README.md)
2. [outputs/manifest.json](../outputs/manifest.json)
3. [outputs/grill-log.md](../outputs/grill-log.md)
4. the current phase output
5. the relevant repo seams in `apps/V2T` and `packages/VT2`
6. preserved raw inputs under `outputs/` only when deeper evidence is needed

## Phase Sequence

| Phase | Focus | Output | Handoff | Orchestrator |
|---|---|---|---|---|
| P0 | Research | [RESEARCH.md](../RESEARCH.md) | [HANDOFF_P0.md](./HANDOFF_P0.md) | [P0_ORCHESTRATOR_PROMPT.md](./P0_ORCHESTRATOR_PROMPT.md) |
| P1 | Design Research | [DESIGN_RESEARCH.md](../DESIGN_RESEARCH.md) | [HANDOFF_P1.md](./HANDOFF_P1.md) | [P1_ORCHESTRATOR_PROMPT.md](./P1_ORCHESTRATOR_PROMPT.md) |
| P2 | Planning | [PLANNING.md](../PLANNING.md) | [HANDOFF_P2.md](./HANDOFF_P2.md) | [P2_ORCHESTRATOR_PROMPT.md](./P2_ORCHESTRATOR_PROMPT.md) |
| P3 | Execution | [EXECUTION.md](../EXECUTION.md) | [HANDOFF_P3.md](./HANDOFF_P3.md) | [P3_ORCHESTRATOR_PROMPT.md](./P3_ORCHESTRATOR_PROMPT.md) |
| P4 | Verification | [VERIFICATION.md](../VERIFICATION.md) | [HANDOFF_P4.md](./HANDOFF_P4.md) | [P4_ORCHESTRATOR_PROMPT.md](./P4_ORCHESTRATOR_PROMPT.md) |

## Constraints

- Preserve the exact root-level phase artifact names already locked in the package.
- Use the current `apps/V2T` plus `packages/VT2` shell-and-sidecar pair unless a phase artifact explicitly documents a migration.
- Do not invent an app-local server path when the existing `@beep/VT2` control plane can carry the slice.
- Preserve the raw PRD and legacy notes under `outputs/`.
- Stop at the active phase exit gate instead of silently rolling forward.

## Exit Condition

This handoff is complete when the current phase output is internally consistent with the README, the manifest, and the repo seams it names, and the next phase can proceed without reopening settled defaults.
