# Phase 1 Orchestrator Prompt

Copy-paste this prompt to start Phase 1.

---

## Prompt

You are executing **Phase 1 (Env Contract Design)** for:
`specs/pending/env-1password-redesign/README.md`

### Mission
Lock the env key contract and migration rules before script/runtime changes.

### Required Deliverables
Create both files:

1. `specs/pending/env-1password-redesign/outputs/key-catalog.md`
2. `specs/pending/env-1password-redesign/outputs/contract-decisions.md`

### Constraints
- Do not include any real secret values in outputs.
- Do not edit runtime scripts or root env files in this phase.
- Keep edits inside `specs/pending/env-1password-redesign/`.

### Work Steps
1. Inventory current env keys and group by namespace.
2. Classify each key: `secret`, `non-secret`, or `public`.
3. Assign migration action: `keep`, `rename`, `drop`, or `derive-at-runtime`.
4. Produce an interpolation-removal map for all `${...}` references.
5. Update `specs/pending/env-1password-redesign/REFLECTION_LOG.md`.
6. Create Phase 2 handoff files:
   - `specs/pending/env-1password-redesign/handoffs/HANDOFF_P2.md`
   - `specs/pending/env-1password-redesign/handoffs/P2_ORCHESTRATOR_PROMPT.md`

### Completion Criteria
- [ ] Both outputs exist and are complete.
- [ ] Every current key has sensitivity + migration action.
- [ ] Interpolation-removal strategy is explicit.
- [ ] Reflection log updated.
- [ ] Phase 2 handoff pair created.

### Primary Context
- `specs/pending/env-1password-redesign/README.md`
- `specs/pending/env-1password-redesign/outputs/current-state-audit.md`
- `specs/pending/env-1password-redesign/outputs/target-architecture.md`
- `specs/pending/env-1password-redesign/handoffs/HANDOFF_P1.md`
