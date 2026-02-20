# Phase 5 Handoff: Verification + Release Docs

**Date**: 2026-02-20  
**Status**: Ready for Phase 5 execution

## Phase 5 Objective

Validate the end-to-end Changesets release flow and produce maintainer/contributor release documentation.

## Inputs You Must Use

- `specs/pending/changesets-turborepo/README.md`
- `specs/pending/changesets-turborepo/outputs/current-release-surface.md`
- `specs/pending/changesets-turborepo/outputs/release-decisions.md`
- `specs/pending/changesets-turborepo/REFLECTION_LOG.md`
- `specs/pending/changesets-turborepo/handoffs/HANDOFF_P5.md`
- `.changeset/config.json`
- `package.json`
- `.github/workflows/release.yml`

## Locked Decisions From Phases 1-4

| Gate | Locked outcome |
|------|----------------|
| Base release branch | `main` |
| Publish surface | Publish now: `@beep/groking-effect-v4`; private workspace packages remain non-publish targets |
| Pre-publish quality gate | `build + test + lint` |
| CI release host | GitHub Actions (`.github/workflows/release.yml`) |

## CI Auth + Secret Assumptions (From Phase 4)

- Required repository secret: `NPM_TOKEN`.
- `NPM_TOKEN` must be an npm automation token with publish rights for the current publish surface (`@beep/groking-effect-v4`).
- `GITHUB_TOKEN` is auto-provided by Actions and is used by `changesets/action` to create/update the release PR.
- Workflow permissions expected for release job: `contents: write` and `pull-requests: write`.

## Phase 5 Tasks

1. Verify local release commands align with locked behavior:
   - `bun run changeset:status`
   - `bun run changeset:version`
   - `bun run release` (or a documented safe validation approach when actual publish is intentionally skipped).
2. Verify CI workflow semantics in `.github/workflows/release.yml`:
   - Pushes to `main` create/update release PRs when unreleased changesets exist.
   - Merged release PR path publishes through `bun run release` (no gate bypass).
3. Add maintainer and contributor release documentation (lightweight, actionable checklist + quickstart steps).
4. Append Phase 5 learnings to `specs/pending/changesets-turborepo/REFLECTION_LOG.md`.
5. Close the spec loop with a final execution summary and any unresolved risks.

## Guardrails

- Do **not** change workspace package `private` flags.
- Do **not** modify publish surface decisions unless explicitly re-opened by maintainers.
- Keep changes focused on verification and release docs; avoid unrelated CI redesign.

## Verification Checklist

- [ ] Local command validation is recorded with outcomes.
- [ ] Workflow behavior expectations are documented and consistent with locked decisions.
- [ ] Maintainer release checklist exists.
- [ ] Contributor changeset/release quick steps exist.
- [ ] `REFLECTION_LOG.md` includes a Phase 5 entry.
