# Phase 5 Orchestrator Prompt

Copy-paste this prompt to start Phase 5.

---

## Prompt

You are executing **Phase 5 (Verification + Release Docs)** for:
`specs/pending/changesets-turborepo/README.md`

### Mission
Validate the implemented Changesets + Turborepo + GitHub Actions release flow and produce maintainer/contributor documentation for ongoing use.

### Primary Context

- `specs/pending/changesets-turborepo/README.md`
- `specs/pending/changesets-turborepo/outputs/current-release-surface.md`
- `specs/pending/changesets-turborepo/outputs/release-decisions.md`
- `specs/pending/changesets-turborepo/handoffs/HANDOFF_P5.md`
- `.changeset/config.json`
- `package.json`
- `.github/workflows/release.yml`

### Required Deliverables

1. Verification pass completed and documented:
   - local commands evaluated (`changeset:status`, `changeset:version`, release-path validation)
   - CI workflow behavior validated against locked assumptions
2. Maintainer release checklist documentation added.
3. Contributor quick-start documentation for adding/merging changesets added.
4. `specs/pending/changesets-turborepo/REFLECTION_LOG.md` updated with Phase 5 notes.
5. Final phase summary created with any unresolved risks/follow-ups.

### Constraints

- Do not change workspace package `private` flags in this phase.
- Do not modify publish surface decisions unless explicitly instructed.
- Keep changes scoped to verification + release documentation.

### Completion Criteria

- [ ] Verification outcomes are recorded with clear pass/fail notes.
- [ ] Maintainer checklist exists and references locked quality gates.
- [ ] Contributor quick steps exist and are accurate for current scripts/workflow.
- [ ] Reflection log updated.
- [ ] Final summary includes unresolved issues (if any).
