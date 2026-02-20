# Phase 2 Orchestrator Prompt

Copy-paste this prompt to start Phase 2.

---

## Prompt

You are executing **Phase 2 (Bootstrap Changesets)** for:
`specs/pending/changesets-turborepo/README.md`

### Mission
Implement the minimum Changesets bootstrap using the locked Phase 1 decisions.

### Primary Context

- `specs/pending/changesets-turborepo/README.md`
- `specs/pending/changesets-turborepo/outputs/current-release-surface.md`
- `specs/pending/changesets-turborepo/outputs/release-decisions.md`
- `specs/pending/changesets-turborepo/handoffs/HANDOFF_P2.md`

### Required Deliverables

1. Root `devDependencies` includes `@changesets/cli`.
2. `.changeset/` initialized via `changeset init`.
3. `.changeset/config.json` updated to match locked decisions:
   - base release branch: `main`
   - initial publish surface behavior from Phase 1
   - `fixed` and `linked` remain empty unless intentionally justified
4. `specs/pending/changesets-turborepo/REFLECTION_LOG.md` updated with Phase 2 notes.
5. Next handoff docs created:
   - `specs/pending/changesets-turborepo/handoffs/HANDOFF_P3.md`
   - `specs/pending/changesets-turborepo/handoffs/P3_ORCHESTRATOR_PROMPT.md`

### Constraints

- Do not add release scripts in this phase (reserved for Phase 3).
- Do not add CI workflows in this phase (reserved for Phase 4).
- Do not change workspace package `private` flags in this phase.

### Completion Criteria

- [ ] `@changesets/cli` added at root.
- [ ] `.changeset` initialization complete.
- [ ] Config reflects Phase 1 decisions.
- [ ] Reflection log updated.
- [ ] P3 handoff docs created.
