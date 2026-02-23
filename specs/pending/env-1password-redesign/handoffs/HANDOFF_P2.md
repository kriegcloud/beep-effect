# Phase 2 Handoff: Integration Design

**Date**: 2026-02-20
**Status**: Ready for Phase 2 execution

## Phase 2 Objective
Translate the locked key contract into executable command/script integration using 1Password CLI.

## Inputs
- `specs/pending/env-1password-redesign/outputs/key-catalog.md`
- `specs/pending/env-1password-redesign/outputs/contract-decisions.md`

## Required Outputs
Create both files:

1. `specs/pending/env-1password-redesign/outputs/script-and-command-matrix.md`
2. `specs/pending/env-1password-redesign/outputs/bootstrap-and-validation-design.md`

## Phase 2 Tasks
1. Map current root scripts to 1Password-wrapped equivalents.
2. Decide if `dotenvx` remains for any workflows or is fully superseded.
3. Specify bootstrap flow for creating local `.env` from new `.env.example`.
4. Define validation checks:
   - missing required keys
   - interpolation ban enforcement (CD-002)
   - secret-literal detection in tracked files
5. Update `REFLECTION_LOG.md` with Phase 2 learnings.
6. Create next-phase handoff files:
   - `specs/pending/env-1password-redesign/handoffs/HANDOFF_P3.md`
   - `specs/pending/env-1password-redesign/handoffs/P3_ORCHESTRATOR_PROMPT.md`

## Guardrails
- Do not introduce real secret values into repo files.
- Keep script changes proposal-only in this phase (no implementation yet).
## Verification
- [ ] Both required output files exist.
- [ ] command matrix includes services, build, test, and dev entrypoints.
- [ ] validation strategy enforces interpolation ban and secret safety.
- [ ] reflection log updated.
