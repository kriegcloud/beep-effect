# Maintainer Release Checklist

Use this checklist for ongoing releases under the locked Changesets + Turborepo policy.

## Locked Gates (Do Not Bypass)

1. Release branch: `main`
2. Publish surface now: `@beep/groking-effect-v4` only
3. Required pre-publish gates: `build + test + lint`
4. Release host: GitHub Actions (`.github/workflows/release.yml`)

## Pre-Merge Validation

1. Confirm each release-relevant PR includes a `.changeset/*.md` file.
2. If a PR intentionally has no release impact, confirm it includes `changeset --empty`.
3. Ensure no change attempts to publish currently private packages (`scratchpad`, `@beep/repo-cli`, `@beep/codebase-search`, `@beep/repo-utils`).
4. Confirm root release script still enforces locked order:  
   `bun run build && bun run test && bun run lint && changeset publish`

## CI Readiness

1. Verify repository secret `NPM_TOKEN` exists and is a valid npm automation token with publish rights for `@beep/groking-effect-v4`.
2. Verify environment `release-publish` exists in GitHub and has required reviewers configured (manual approval gate).
3. Verify manual publish guard is still enabled in `.github/workflows/release.yml`:
   - publish job only runs on `workflow_dispatch`
   - `confirm_publish` must equal `PUBLISH`
   - publish job targets environment `release-publish`
4. Verify workflow permissions in `.github/workflows/release.yml` remain:
   - `contents: write`
   - `pull-requests: write`
5. Confirm release workflow still uses:
   - release PR path: `version: bun run changeset:version`
   - publish path: `run: bun run release`

## Release Execution

1. Merge release-impacting PRs into `main`.
2. Wait for `Release` workflow to create/update the Changesets release PR.
3. Review generated release PR:
   - version bumps are expected
   - changelog entries are accurate
   - only intended publish-surface packages are included
4. Merge the release PR (this updates `main`, but does not auto-publish).
5. Manually run `Release` workflow via `workflow_dispatch` and set `confirm_publish` to `PUBLISH`.
6. Approve environment gate for `release-publish` (required reviewers).
7. Confirm the publish run succeeds in GitHub Actions.

## Post-Release Checks

1. Verify expected version/changelog landed on `main`.
2. Verify package/version visibility on npm for `@beep/groking-effect-v4`.
3. If publish fails, fix forward in a new PR; do not bypass release gates.
