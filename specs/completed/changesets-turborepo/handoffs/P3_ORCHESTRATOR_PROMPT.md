# Phase 3 Orchestrator Prompt

Copy-paste this prompt to start Phase 3.

---

## Prompt

You are executing **Phase 3 (Turborepo-Aligned Scripts)** for:
`specs/completed/changesets-turborepo/README.md`

### Mission
Add root release scripts that coordinate Changesets and Turborepo using the locked decisions from Phases 1 and 2.

### Primary Context

- `specs/completed/changesets-turborepo/README.md`
- `specs/completed/changesets-turborepo/outputs/current-release-surface.md`
- `specs/completed/changesets-turborepo/outputs/release-decisions.md`
- `specs/completed/changesets-turborepo/handoffs/HANDOFF_P3.md`
- `.changeset/config.json`
- `package.json`

### Required Deliverables

1. Root `package.json` scripts added:
   - `changeset`
   - `changeset:status`
   - `changeset:version`
   - `release`
2. `release` script enforces locked pre-publish quality gates (`build + test + lint`) before `changeset publish`.
3. `specs/completed/changesets-turborepo/REFLECTION_LOG.md` updated with Phase 3 notes.
4. Next handoff docs created:
   - `specs/completed/changesets-turborepo/handoffs/HANDOFF_P4.md`
   - `specs/completed/changesets-turborepo/handoffs/P4_ORCHESTRATOR_PROMPT.md`

### Constraints

- Do not add CI workflows in this phase (reserved for Phase 4).
- Do not change workspace package `private` flags in this phase.
- Do not modify publish surface decisions unless explicitly instructed.

### Completion Criteria

- [ ] Required root scripts exist.
- [ ] Release path runs `build`, `test`, and `lint` before publish.
- [ ] Reflection log updated.
- [ ] P4 handoff docs created.
