# Release Decisions (Phase 1)

**Captured**: 2026-02-20  
**Status**: Decision baseline set before tooling/CI mutations

## Decision Gate Outcomes

| Decision gate | Status | Outcome | Owner | Follow-up trigger |
|---------------|--------|---------|-------|-------------------|
| 1. Base release branch | `resolved` | Use `main` as the Changesets base release branch. | Repo maintainers | Revisit only if default branch strategy changes from `main`. |
| 2. Publish surface | `resolved` | Publish now: `@beep/groking-effect-v4`. Keep all current private workspace packages private in this rollout (`scratchpad`, `@beep/repo-cli`, `@beep/codebase-search`, `@beep/repo-utils`). | Repo maintainers | Revisit when a private package is intentionally promoted to `private: false` and has maintainer sign-off for external consumers. |
| 3. Pre-publish quality gates | `resolved` | Require `build + test + lint` before publish. Baseline commands: `bun run build`, `bun run test`, `bun run lint`. | Release maintainers | Revisit if release duration or flake rate forces a policy change. |
| 4. CI release host | `resolved` | Use GitHub Actions as the release host for Changesets PR + publish automation. | Repo maintainers | Revisit only if repo hosting or CI platform changes. |

## Evidence Notes (Phase 1)

- `origin` points to GitHub (`git@github.com:kriegcloud/beep-effect.git`), and remote HEAD is `main`.
- No `.github/workflows` directory exists yet, so release workflow will be introduced in a later phase.
- Workspace inventory and package-by-package intent are captured in `outputs/current-release-surface.md`.

## Deferred (Non-Gate) Follow-Ups

| Item | State | Owner | Trigger |
|------|-------|-------|---------|
| External publishing policy for tooling packages (`@beep/repo-cli`, `@beep/codebase-search`, `@beep/repo-utils`) | `deferred` | Repo maintainers | Trigger when any tooling package is proposed for public support/semver guarantees. |
