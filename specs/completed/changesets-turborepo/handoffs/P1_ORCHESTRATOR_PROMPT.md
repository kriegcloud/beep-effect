# Phase 1 Orchestrator Prompt

Copy-paste this prompt to start Phase 1.

---

## Prompt

You are executing **Phase 1 (Inventory + Decision Capture)** for:
`specs/completed/changesets-turborepo/README.md`

### Mission
Produce decision-ready release documentation before any tooling/CI mutations.

### Required Deliverables
Create both files:

1. `specs/completed/changesets-turborepo/outputs/current-release-surface.md`
2. `specs/completed/changesets-turborepo/outputs/release-decisions.md`

### Decision Gates (Must Be Explicit)

1. Base release branch (`main` or alternative)
2. Publish surface (package-by-package intent)
3. Pre-publish quality gates (`build` vs `build + test + lint`)
4. CI release host (GitHub Actions assumptions)

### Constraints

- Do not modify `package.json`, `turbo.json`, `.changeset/`, or CI workflows in this phase.
- Keep edits inside `specs/completed/changesets-turborepo/`.
- If a decision is unresolved, mark `deferred` with owner and follow-up trigger.

### Work Steps

1. Inventory workspace packages and classify release intent.
2. Document branch and CI assumptions.
3. Resolve or defer all four decision gates.
4. Update `specs/completed/changesets-turborepo/REFLECTION_LOG.md` with Phase 1 notes.
5. Create handoff docs for next phase:
   - `specs/completed/changesets-turborepo/handoffs/HANDOFF_P2.md`
   - `specs/completed/changesets-turborepo/handoffs/P2_ORCHESTRATOR_PROMPT.md`

### Completion Criteria

- [ ] Both outputs exist and are complete.
- [ ] All four decision gates are explicitly resolved or deferred.
- [ ] Reflection log updated with Phase 1 learnings.
- [ ] P2 handoff docs created.

### Primary Context

- `specs/completed/changesets-turborepo/README.md`
- `specs/completed/changesets-turborepo/handoffs/HANDOFF_P1.md`
