# Phase 1 Handoff: Inventory + Decision Capture

**Date**: 2026-02-20
**Status**: Ready for Phase 1 execution

## Phase 1 Objective

Capture release decisions before mutating tooling or CI.

This phase is **documentation-only** and produces the decision baseline needed for Changesets implementation.

## Required Outputs

Create both files:

1. `specs/completed/changesets-turborepo/outputs/current-release-surface.md`
2. `specs/completed/changesets-turborepo/outputs/release-decisions.md`

## Decision Gates (Must Be Explicit)

| Gate | Required Outcome |
|------|------------------|
| Base release branch | Confirm `main` or explicitly choose alternative |
| Publish surface | List each workspace package with `publish now` / `private` / `deferred` |
| Pre-publish quality gates | Choose release gate (`build` vs `build + test + lint`) |
| CI release host | Confirm GitHub Actions workflow assumptions |

If any decision is not final, mark it as `deferred` with owner + follow-up condition.

## Phase 1 Tasks

1. Inventory workspace packages and classify release intent (`publishable`, `private`, `sandbox`, `fixture/test-only`).
2. Capture current branch/release assumptions and confirm target release branch.
3. Propose decision outcomes for all four gates.
4. Document tradeoffs and deferred decisions in `outputs/release-decisions.md`.
5. Update `REFLECTION_LOG.md` with Phase 1 learnings.
6. Create next-phase handoff docs:
   - `specs/completed/changesets-turborepo/handoffs/HANDOFF_P2.md`
   - `specs/completed/changesets-turborepo/handoffs/P2_ORCHESTRATOR_PROMPT.md`

## Guardrails

- Do **not** modify `package.json`, `turbo.json`, `.changeset/`, or CI workflows in Phase 1.
- Do **not** assume package publish intent from `publishConfig` alone; record explicit intent.
- Keep changes scoped to this spec folder.

## Verification

- [ ] Both required output files exist and include all four decision gates.
- [ ] Every workspace package has a release-intent classification.
- [ ] Deferred decisions have clear owner + next step.
- [ ] `REFLECTION_LOG.md` has a Phase 1 entry.

## Next Phase Preview (P2)

P2 starts implementation only after Decision Gates are captured:

- add `@changesets/cli`,
- run `changeset init`,
- configure `.changeset/config.json` per Phase 1 decisions.
