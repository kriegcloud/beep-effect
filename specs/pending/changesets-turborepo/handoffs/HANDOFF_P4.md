# Phase 4 Handoff: CI Release Automation

**Date**: 2026-02-20  
**Status**: Ready for Phase 4 execution

## Phase 4 Objective

Implement CI release automation on GitHub Actions using Changesets release PR + publish flow.

## Inputs You Must Use

- `specs/pending/changesets-turborepo/README.md`
- `specs/pending/changesets-turborepo/outputs/current-release-surface.md`
- `specs/pending/changesets-turborepo/outputs/release-decisions.md`
- `specs/pending/changesets-turborepo/REFLECTION_LOG.md`
- `specs/pending/changesets-turborepo/handoffs/HANDOFF_P4.md`
- `.changeset/config.json`
- `package.json`

## Locked Decisions From Phase 1 + 3

| Gate | Locked outcome |
|------|----------------|
| Base release branch | `main` |
| Publish surface | Publish now: `@beep/groking-effect-v4`; private workspace packages remain non-publish targets |
| Pre-publish quality gate | `build + test + lint` |
| CI release host | GitHub Actions |

## Phase 4 Tasks

1. Add a release workflow at `.github/workflows/release.yml`.
2. Implement Changesets release PR + publish automation using root scripts:
   - version step anchored to `bun run changeset:version`
   - publish step anchored to `bun run release`
3. Ensure workflow behavior targets the locked base branch (`main`) and does not bypass release quality gates.
4. Document required CI secrets/variables for publish (`NPM_TOKEN`, token usage assumptions for GitHub Actions).
5. Update `specs/pending/changesets-turborepo/REFLECTION_LOG.md` with Phase 4 learnings.
6. Create next-phase handoff files:
   - `specs/pending/changesets-turborepo/handoffs/HANDOFF_P5.md`
   - `specs/pending/changesets-turborepo/handoffs/P5_ORCHESTRATOR_PROMPT.md`

## Guardrails

- Do **not** change workspace package `private` flags in this phase.
- Do **not** modify publish-surface decisions unless explicitly re-opened by maintainers.
- Keep scope focused on release automation; avoid unrelated CI redesign.

## Verification Checklist

- [ ] `.github/workflows/release.yml` exists and runs on GitHub Actions.
- [ ] Workflow uses Changesets release PR + publish flow.
- [ ] Publish path executes locked gates (`build`, `test`, `lint`) before publish via `bun run release`.
- [ ] Required secrets/variables are documented for maintainers.
- [ ] `REFLECTION_LOG.md` includes a Phase 4 entry.
