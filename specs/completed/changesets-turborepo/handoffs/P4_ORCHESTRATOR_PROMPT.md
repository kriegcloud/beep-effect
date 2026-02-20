# Phase 4 Orchestrator Prompt

Copy-paste this prompt to start Phase 4.

---

## Prompt

You are executing **Phase 4 (CI Release Automation)** for:
`specs/completed/changesets-turborepo/README.md`

### Mission
Add GitHub Actions release automation for Changesets release PR + publish using locked decisions from earlier phases.

### Primary Context

- `specs/completed/changesets-turborepo/README.md`
- `specs/completed/changesets-turborepo/outputs/current-release-surface.md`
- `specs/completed/changesets-turborepo/outputs/release-decisions.md`
- `specs/completed/changesets-turborepo/handoffs/HANDOFF_P4.md`
- `.changeset/config.json`
- `package.json`

### Required Deliverables

1. Release workflow created:
   - `.github/workflows/release.yml`
2. Workflow implements Changesets release PR + publish automation and uses root scripts:
   - version command: `bun run changeset:version`
   - publish command: `bun run release`
3. Workflow is aligned to locked release branch assumptions (`main`) and does not bypass release gates.
4. Required CI secrets/variables are documented (at minimum `NPM_TOKEN` and token usage assumptions).
5. `specs/completed/changesets-turborepo/REFLECTION_LOG.md` updated with Phase 4 notes.
6. Next handoff docs created:
   - `specs/completed/changesets-turborepo/handoffs/HANDOFF_P5.md`
   - `specs/completed/changesets-turborepo/handoffs/P5_ORCHESTRATOR_PROMPT.md`

### Constraints

- Do not change workspace package `private` flags in this phase.
- Do not modify publish surface decisions unless explicitly instructed.
- Keep CI changes scoped to release automation path.

### Completion Criteria

- [ ] Release workflow file exists at `.github/workflows/release.yml`.
- [ ] Changesets PR + publish flow is wired through root scripts.
- [ ] Required secrets/variables are documented.
- [ ] Reflection log updated.
- [ ] P5 handoff docs created.
