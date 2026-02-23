# Phase 2 Orchestrator Prompt

Copy-paste this prompt to start Phase 2.

---

## Prompt

You are executing **Phase 2 (Integration Design)** for:
`specs/pending/env-1password-redesign/README.md`

### Mission
Design command wrappers and bootstrap/validation strategy for the locked env contract.

### Required Deliverables
Create both files:

1. `specs/pending/env-1password-redesign/outputs/script-and-command-matrix.md`
2. `specs/pending/env-1password-redesign/outputs/bootstrap-and-validation-design.md`

### Constraints
- No real secrets in any output.
- Do not implement script changes yet; design only.
- Keep edits inside `specs/pending/env-1password-redesign/`.

### Work Steps
1. Map existing root scripts to 1Password execution (`op run --env-file=.env -- ...`).
2. Decide dotenvx role (retain partially or replace fully).
3. Design bootstrap flow for new `.env.example` contract.
4. Design env validation rules (required keys, interpolation policy, secret hygiene).
5. Ensure `NEXT_PUBLIC_*` values are explicit literals in template output.
6. Update reflection log and create Phase 3 handoff pair.

### Completion Criteria
- [ ] Both outputs exist and are complete.
- [ ] command mapping covers core local workflows.
- [ ] validation design enforces CD-002 interpolation ban.
- [ ] reflection log updated.
- [ ] Phase 3 handoff pair created.

### Primary Context
- `specs/pending/env-1password-redesign/README.md`
- `specs/pending/env-1password-redesign/outputs/key-catalog.md`
- `specs/pending/env-1password-redesign/outputs/contract-decisions.md`
- `specs/pending/env-1password-redesign/handoffs/HANDOFF_P2.md`
