# P[N] Orchestrator Prompt Template

You are executing Phase P[N] of the `[spec-name]` spec: **[phase name]**.

## Hard Rules

- `[planning-only vs implementation allowed]`
- Scope/non-goals (repeat verbatim): `[bullets]`
- **Handoff gate (explicit)**: when context feels ~50% consumed (or before large/risky work), STOP and checkpoint:
  - `handoffs/HANDOFF_P[N].md`
  - `handoffs/P[N]_ORCHESTRATOR_PROMPT.md`

## Inputs

- `[list the exact files to read first]`

## Objectives (Pass/Fail)

1. `[objective]`
2. `[objective]`
3. `[objective]`

## Required Outputs (Update In-Place)

- `[which spec files must be updated]`

Optional:

- `[new outputs/*.md files to create]`

## Verification

```bash
# Record exact commands and PASS/FAIL + date after execution.
```

## Phase Completion Requirement (Handoffs)

At the end of this phase, create/update:

- `handoffs/HANDOFF_P[N+1].md`
- `handoffs/P[N+1]_ORCHESTRATOR_PROMPT.md`

