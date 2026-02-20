# Phase 1 Handoff: Env Contract Design

**Date**: 2026-02-20
**Status**: Ready for Phase 1 execution

## Phase 1 Objective
Define the full env key contract and migration mapping before changing runtime scripts or local workflows.

## Required Outputs
Create both files:

1. `specs/pending/env-1password-redesign/outputs/key-catalog.md`
2. `specs/pending/env-1password-redesign/outputs/contract-decisions.md`

## Required Decisions

| Decision | Required Outcome |
|----------|------------------|
| Key ownership | Every current key classified as keep/rename/drop/derive |
| Sensitivity class | Every key tagged secret/non-secret/public |
| Interpolation removal | Explicit replacement approach for each interpolated key |
| Namespace layout | Final grouped ordering for new `.env.example` |

## Phase 1 Tasks
1. Inventory all current env keys by namespace (without exposing values).
2. Mark sensitivity and migration action per key.
3. Propose final section ordering for `.env.example`.
4. Define interpolation replacements for all derived fields.
5. Update `REFLECTION_LOG.md` with Phase 1 learnings.
6. Create next-phase handoff files:
   - `specs/pending/env-1password-redesign/handoffs/HANDOFF_P2.md`
   - `specs/pending/env-1password-redesign/handoffs/P2_ORCHESTRATOR_PROMPT.md`

## Guardrails
- Do not paste secret values into any spec file.
- Do not edit runtime scripts in Phase 1.
- Keep work scoped to `specs/pending/env-1password-redesign/`.

## Verification
- [ ] Both required output files exist.
- [ ] Every current env key has sensitivity + migration action.
- [ ] Interpolation removal map is complete.
- [ ] Reflection log includes a Phase 1 entry.
