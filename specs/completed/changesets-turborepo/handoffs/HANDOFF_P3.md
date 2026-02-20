# Phase 3 Handoff: Turborepo-Aligned Scripts

**Date**: 2026-02-20  
**Status**: Ready for Phase 3 execution

## Phase 3 Objective

Implement root release scripts that use Changesets for version/publish mutation and Turborepo for package task execution.

## Inputs You Must Use

- `specs/completed/changesets-turborepo/README.md`
- `specs/completed/changesets-turborepo/outputs/current-release-surface.md`
- `specs/completed/changesets-turborepo/outputs/release-decisions.md`
- `specs/completed/changesets-turborepo/REFLECTION_LOG.md`
- `.changeset/config.json`
- `package.json`

## Locked Decisions From Phase 1 + 2

| Gate | Locked outcome |
|------|----------------|
| Base release branch | `main` |
| Publish surface | Publish now: `@beep/groking-effect-v4`; private workspace packages remain non-publish targets |
| Pre-publish quality gate | `build + test + lint` |
| CI release host | GitHub Actions (implemented in Phase 4, not Phase 3) |

## Phase 3 Tasks

1. Add root scripts in `package.json`:
   - `changeset`
   - `changeset:status`
   - `changeset:version`
   - `release`
2. Ensure `release` runs pre-publish quality gates in locked order (`build`, `test`, `lint`) via existing root scripts/Turbo orchestration before `changeset publish`.
3. Keep publish/version mutation as root workflow operations (do not move these into per-package scripts).
4. Update `specs/completed/changesets-turborepo/REFLECTION_LOG.md` with Phase 3 learnings.
5. Create next-phase handoff docs:
   - `specs/completed/changesets-turborepo/handoffs/HANDOFF_P4.md`
   - `specs/completed/changesets-turborepo/handoffs/P4_ORCHESTRATOR_PROMPT.md`

## Guardrails

- Do **not** add CI workflows in this phase (Phase 4 owns CI automation).
- Do **not** change workspace package `private` flags.
- Do **not** alter publish surface decisions unless explicitly re-opened by maintainers.

## Verification Checklist

- [ ] Root scripts for `changeset`, `changeset:status`, `changeset:version`, and `release` exist.
- [ ] `release` script gates publish with `build + test + lint` before `changeset publish`.
- [ ] No CI workflow files were added.
- [ ] `REFLECTION_LOG.md` includes a Phase 3 entry.
- [ ] P4 handoff docs are created.
