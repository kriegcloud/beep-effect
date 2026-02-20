# Changesets Release Workflow (Turborepo-Aligned)

## Status
ACTIVE

## Owner
@elpresidank

## Created
2026-02-20

## Purpose
Implement Changesets-based versioning and publishing for this monorepo, using Turborepo-recommended task orchestration so release workflows stay fast, cache-aware, and package-graph-correct.

## Why This Spec Exists
The repo currently has versioned workspace packages but no formal release workflow. Turborepo recommends using Changesets for package versioning and publishing in monorepos, with package tasks run through `turbo run` and release mutation steps handled explicitly.

## Primary References
- Turborepo guide: [Publishing libraries](https://turborepo.com/repo/docs/guides/publishing-libraries)
- Changesets CLI docs: [changesets README](https://raw.githubusercontent.com/changesets/changesets/main/packages/cli/README.md)
- Changesets config docs: [config-file-options.md](https://raw.githubusercontent.com/changesets/changesets/main/docs/config-file-options.md)
- Changesets GitHub Action docs: [changesets/action](https://github.com/changesets/action)
- Local Turborepo skill: `.agents/skills/turborepo/SKILL.md`

## Current Workspace Release Surface
| Package | Version | Private | Current Intent |
|---------|---------|---------|----------------|
| `@beep/groking-effect-v4` | `0.0.0` | `false` | Publishable package |
| `@beep/repo-cli` | `0.0.0` | `true` | Internal tooling |
| `@beep/repo-utils` | `0.0.0` | `true` | Internal tooling |
| `@beep/codebase-search` | `0.0.0` | `true` | Internal tooling |
| `scratchpad` | `0.0.0` | `true` | Internal-only sandbox |

## Guiding Decisions
| ID | Decision | Rationale |
|----|----------|-----------|
| D1 | Use `@changesets/cli` at root | Officially recommended by Turborepo for monorepo versioning/publishing |
| D2 | Keep package build/test/lint orchestration in Turborepo (`turbo run ...`) | Aligns with Turborepo package-task model and caching guidance |
| D3 | Keep release mutation steps (`changeset version`, `changeset publish`) as root release scripts | These are repo-level version/publish operations, not package build tasks |
| D4 | Default to releasing only non-private packages | Matches npm + Changesets behavior and avoids unnecessary internal version churn |
| D5 | Use Changesets GitHub Action for Release PR + publish | Recommended operational flow for predictable changelog/version releases |

## Scope
### In Scope
- Add Changesets tooling and initialize `.changeset/`
- Define root scripts for authoring, versioning, and publishing
- Wire release scripts to Turborepo package tasks (`turbo run build`, optionally plus test/lint)
- Add CI workflow to open release PRs and publish on merge
- Document contributor release workflow (when to add a changeset)
- Define behavior for private packages and package access mode

### Out of Scope
- Migrating package names/scopes
- Converting private tooling packages to public packages
- Multi-registry publish support
- Canary/nightly prerelease channels

## Implementation Plan

### Phase 1: Bootstrap Changesets
1. Add root dev dependency: `@changesets/cli`.
2. Run `changeset init` to create `.changeset/README.md` and `.changeset/config.json`.
3. Update `.changeset/config.json` for this repo:
   - `baseBranch`: `main` (or repo default branch if different)
   - `access`: `public`
   - `updateInternalDependencies`: `patch`
   - `privatePackages`: `{ "version": false, "tag": false }`
4. Keep `fixed` and `linked` empty until we intentionally introduce lockstep versioning.

### Phase 2: Root Scripts and Turbo Alignment
1. Add root scripts:
   - `changeset`: `changeset`
   - `changeset:version`: `changeset version`
   - `changeset:status`: `changeset status --verbose`
   - `release`: `turbo run build && changeset publish`
2. Keep task execution package-based:
   - Build/test/lint remains in package scripts and `turbo.json` tasks.
   - Root scripts only orchestrate via `turbo run` plus Changesets commands.
3. Do not add cacheable turbo tasks for publish/mutation operations.

### Phase 3: CI Release Automation
1. Add `.github/workflows/release.yml` using `changesets/action@v1`.
2. Workflow behavior:
   - On push to `main`, action opens/updates a Release PR when unpublished changesets exist.
   - When no pending changesets remain, action runs publish step.
3. Configure action scripts:
   - `version`: `bun run changeset:version`
   - `publish`: `bun run release`
4. Required CI secrets/vars:
   - `NPM_TOKEN`
   - `GITHUB_TOKEN` (provided by Actions)
   - `TURBO_TOKEN` and `TURBO_TEAM` for remote cache (optional but recommended)

### Phase 4: Contributor and Maintainer Workflow Docs
1. Add release workflow docs (for example `docs/releasing.md`) covering:
   - When to create a changeset
   - How to choose patch/minor/major
   - How release PRs are merged
2. Add a short "release checklist" for maintainers.

## Proposed `.changeset/config.json` Baseline
```json
{
  "$schema": "https://unpkg.com/@changesets/config@3.1.1/schema.json",
  "changelog": "@changesets/cli/changelog",
  "commit": false,
  "fixed": [],
  "linked": [],
  "access": "public",
  "baseBranch": "main",
  "updateInternalDependencies": "patch",
  "ignore": [],
  "privatePackages": {
    "version": false,
    "tag": false
  }
}
```

## Proposed Release Workflow Skeleton
```yaml
name: Release

on:
  push:
    branches:
      - main

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - uses: oven-sh/setup-bun@v2
        with:
          bun-version: 1.3.9

      - name: Install dependencies
        run: bun install --frozen-lockfile

      - name: Create Release PR or Publish
        uses: changesets/action@v1
        with:
          version: bun run changeset:version
          publish: bun run release
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
          TURBO_TOKEN: ${{ secrets.TURBO_TOKEN }}
          TURBO_TEAM: ${{ vars.TURBO_TEAM }}
```

## Success Criteria
- [ ] `@changesets/cli` is installed and `.changeset/config.json` is committed
- [ ] Root scripts exist for `changeset`, `changeset:version`, `changeset:status`, `release`
- [ ] Release script uses `turbo run` for package tasks before publish
- [ ] Release workflow exists and uses `changesets/action`
- [ ] A release PR is auto-created when a PR with changesets lands on `main`
- [ ] Publish succeeds from CI with `NPM_TOKEN`
- [ ] Private packages are not version/tag churned by default

## Risks and Mitigations
| Risk | Impact | Mitigation |
|------|--------|------------|
| Wrong `baseBranch` in Changesets config | Release PR generation fails or compares wrong range | Confirm default branch before merge (`main` assumed in this spec) |
| Fixture/test `package.json` files accidentally detected | Noise or incorrect release targeting | Validate package detection with `changeset status`; add explicit ignore entries only if needed |
| Publish without prior build artifacts | Broken npm package | Keep `release` script as `turbo run build && changeset publish` |
| Missing npm auth in CI | Publish fails | Require `NPM_TOKEN` secret in workflow docs and setup |

## Verification Commands
```bash
# Initialize (once)
bun add -D @changesets/cli
bunx changeset init

# Day-to-day authoring
bun run changeset
bun run changeset:status

# Simulate release locally
bun run changeset:version
bun run build
bun run release
```

## Open Questions
1. Is `main` confirmed as the long-lived release branch?
2. Should `@beep/repo-cli`, `@beep/repo-utils`, or `@beep/codebase-search` remain private for the next quarter?
3. Do we want a prerelease channel (`next`) in phase 1, or defer until stable publish cadence exists?

## Exit Condition
This spec is complete when Changesets-based releases can be performed end-to-end from merged PRs with Turborepo-managed package builds and documented maintainer workflow.
