# Git Workflow & CI Optimization

## Current State in This Repo

### Lefthook (v2.1.1)
- **pre-commit** (parallel): biome format + eslint jsdoc on staged files
- **pre-push** (parallel): turbo build + tsc --noEmit + vitest run
- Uses `git add {staged_files}` manually in the biome command instead of `stage_fixed: true`
- No commit message linting
- Orphaned `.lintstagedrc.json` still present (dead config from Husky era)

### Turborepo (v2.8.10)
- Tasks: `build`, `lint`, `lint:fix`, `check`, `docgen`
- `lint` depends on `^lint` (cascading lint through dependency graph -- unusual/slow)
- No `test` task defined (tests bypass Turborepo caching entirely)
- No `dev` task defined
- `globalEnv` declares `TURBO_TOKEN`/`TURBO_TEAM` but remote caching is not configured
- No `--affected` usage in any script

### GitHub Actions CI
- **Only `release.yml` exists** -- no check/PR workflow at all
- No PR quality gates (lint, typecheck, test are not required checks)
- No Bun dependency caching
- No Turborepo remote cache in CI
- No matrix testing
- No dependency review / security scanning
- Node 20 in CI but `.nvmrc` says 22

### Changesets (v2.29.8)
- `access: "restricted"`, `baseBranch: "main"`, `commit: false`
- Uses default `@changesets/cli/changelog` (no PR/commit links in changelog)
- Ignores internal tooling packages (correct)
- No changeset-bot installed for PR comments
- No linked package groups configured

### Commit Message Conventions
- No enforcement at all -- no commitlint, no conventional commits, no commit-msg hook
- Release PR uses `chore(release): version packages` (implies intent for conventional commits)

---

## Recommendations

---

### 1. Lefthook Config Upgrade

### 1.1 Use `stage_fixed` Instead of Manual `git add`

- **What**: Replace `&& git add {staged_files}` with Lefthook's built-in `stage_fixed: true`
- **Why**: Current config manually re-stages files which can cause race conditions with parallel commands and is error-prone. `stage_fixed` is the official, safer mechanism.
- **Type**: Config upgrade
- **Maturity**: Stable
- **Effort**: Low (< 1hr)
- **Priority**: P0 (must-have)
- **Bun compatible**: Yes
- **Pros**:
  - Avoids race conditions with parallel pre-commit commands
  - Respects only staged changes (unstaged changes remain untouched)
  - Simpler config, less error-prone
  - Officially recommended by Lefthook
- **Cons**:
  - None
- **Conflicts with**: None
- **Config snippet**:
```yaml
pre-commit:
  parallel: true
  commands:
    biome:
      glob: "*.{ts,tsx,js,jsx,json,jsonc,css,md}"
      run: bunx biome check --write {staged_files}
      stage_fixed: true
    jsdoc:
      glob: "tooling/*/src/**/*.ts"
      exclude: "tooling/*/src/internal/**|tooling/_test-*/src/**|**/*.test.ts|**/*.spec.ts|**/*.d.ts"
      run: npx eslint --config eslint.config.mjs --ignore-pattern 'tooling/_test-*/**' {staged_files}
```

### 1.2 Add `commit-msg` Hook with commitlint

- **What**: Add commit message validation using commitlint with conventional commits
- **Why**: No commit message enforcement exists. The release workflow already implies conventional commit format (`chore(release): ...`). Enforcing it prevents malformed history and enables automated changelog generation.
- **Type**: New tool
- **Maturity**: Stable
- **Effort**: Low (< 1hr)
- **Priority**: P0 (must-have)
- **Bun compatible**: Yes
- **Pros**:
  - Enforces consistent commit messages across all contributors (human and AI)
  - Enables scope-based filtering for changelogs
  - Standard convention well-understood by the ecosystem
  - Pairs with changesets for release notes
- **Cons**:
  - Slight learning curve for contributors unfamiliar with conventional commits
  - Can be annoying on WIP commits (mitigated by `--no-verify` when needed)
- **Conflicts with**: None
- **Config snippet**:

```yaml
# lefthook.yml addition
commit-msg:
  commands:
    commitlint:
      run: bunx commitlint --edit {1}
```

### 1.3 Optimize `pre-push` Hook

- **What**: Make pre-push faster by using `--affected` and splitting heavy tasks
- **Why**: Current pre-push runs full `turbo build` + `tsc --noEmit` + full `vitest run` -- this can take minutes and discourages frequent pushes.
- **Type**: Config upgrade
- **Maturity**: Stable
- **Effort**: Low (< 1hr)
- **Priority**: P1 (high value)
- **Bun compatible**: Yes
- **Pros**:
  - Faster push cycle, less developer friction
  - Only checks what changed, not the entire monorepo
  - Heavy full checks deferred to CI where they belong
- **Cons**:
  - Could miss cross-package regressions locally (CI catches these)
- **Conflicts with**: None
- **Config snippet**:
```yaml
pre-push:
  parallel: true
  commands:
    typecheck:
      run: npx turbo build check --affected
    test:
      run: npx vitest run --changed
```

### 1.4 Remove Orphaned `.lintstagedrc.json`

- **What**: Delete dead `.lintstagedrc.json` config
- **Why**: Lefthook replaced Husky+lint-staged. The orphaned config causes confusion.
- **Type**: Config upgrade
- **Maturity**: N/A
- **Effort**: Low (< 1hr)
- **Priority**: P0 (must-have)
- **Bun compatible**: N/A
- **Pros**: Removes confusion, cleaner repo root
- **Cons**: None
- **Conflicts with**: None

---

### 2. Commitlint + Conventional Commits

### 2.1 `@commitlint/config-conventional`

- **What**: Standard conventional commits ruleset for commitlint
- **Why**: Provides the base rules (type-enum, scope-case, subject-case, etc.) aligned with the Angular/Conventional Commits spec. Minimal config, maximum ecosystem compatibility.
- **Type**: New tool
- **Maturity**: Stable
- **Effort**: Low (< 1hr)
- **Priority**: P0 (must-have)
- **Bun compatible**: Yes
- **Pros**:
  - Industry standard, well-documented
  - Works out of the box with zero custom config
  - Compatible with changesets, semantic-release, and all CI tools
  - Enforces type, scope, subject format
- **Cons**:
  - Default scope list is open (allows any scope) -- needs monorepo customization
- **Conflicts with**: None
- **Config snippet**:
```bash
bun add -D @commitlint/cli @commitlint/config-conventional
```
```js
// commitlint.config.mjs
import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const getDirectories = (dir) =>
  readdirSync(dir)
    .filter((f) => statSync(join(dir, f)).isDirectory());

const scopes = [
  ...getDirectories("packages"),
  ...getDirectories("tooling"),
  ...getDirectories("apps"),
  "repo",   // root-level changes
  "deps",   // dependency updates
  "ci",     // CI/CD changes
  "release" // release-related
];

export default {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "scope-enum": [2, "always", scopes],
    "scope-empty": [1, "never"], // warn if no scope
    "body-max-line-length": [0], // disable for AI-generated commits
  },
};
```

### 2.2 `commitlint-plugin-workspace-scopes` (Alternative)

- **What**: Auto-discovers workspace package names as valid scopes
- **Why**: Eliminates manual scope list maintenance as packages are added/removed
- **Type**: New tool
- **Maturity**: Growing
- **Effort**: Low (< 1hr)
- **Priority**: P2 (nice to have)
- **Bun compatible**: Yes
- **Pros**:
  - Zero maintenance -- auto-reads workspace packages
  - Works with Bun workspaces
- **Cons**:
  - Extra dependency for functionality achievable with a few lines of custom config
  - Less control over scope naming
- **Conflicts with**: Custom scope-enum rule (use one or the other)
- **Config snippet**:
```bash
bun add -D commitlint-plugin-workspace-scopes
```
```js
// commitlint.config.mjs
export default {
  extends: ["@commitlint/config-conventional"],
  plugins: ["commitlint-plugin-workspace-scopes"],
  rules: {
    "scope-enum": [2, "always", []],  // overridden by plugin
  },
};
```

---

### 3. PR Size & Quality Checks

### 3.1 PR Size Labeler (`cbrgm/pr-size-labeler-action`)

- **What**: Automatically labels PRs by size (XS/S/M/L/XL) based on lines changed
- **Why**: No PR quality metrics exist. Size labels provide instant visual feedback in PR lists and encourage smaller, reviewable PRs.
- **Type**: New tool
- **Maturity**: Stable
- **Effort**: Low (< 1hr)
- **Priority**: P1 (high value)
- **Bun compatible**: Yes (language-agnostic)
- **Pros**:
  - Zero-config instant value
  - Visual indicator in PR list
  - Can be used for review routing (e.g., XL PRs need 2 reviewers)
  - Configurable thresholds and file exclusions (ignore lockfiles, generated code)
- **Cons**:
  - Lines changed is a crude metric (does not measure complexity)
  - Labeling alone does not block merges
- **Conflicts with**: None
- **Config snippet**:
```yaml
# .github/workflows/pr-size.yml
name: PR Size
on:
  pull_request:
    types: [opened, synchronize]

jobs:
  label:
    runs-on: ubuntu-latest
    permissions:
      pull-requests: write
    steps:
      - uses: cbrgm/pr-size-labeler-action@v2
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          xs_label: "size/XS"
          xs_max_size: 10
          s_label: "size/S"
          s_max_size: 50
          m_label: "size/M"
          m_max_size: 200
          l_label: "size/L"
          l_max_size: 500
          xl_label: "size/XL"
          fail_if_xl: false
          files_to_ignore: |
            bun.lock
            **/*.snap
            **/dist/**
```

### 3.2 Danger JS or Custom PR Quality Checks

- **What**: Programmable PR review bot that can check size, missing tests, missing changesets, etc.
- **Why**: More flexible than simple size labeling. Can enforce repo-specific rules like "every PR touching `packages/` must include a changeset" or "test files must accompany new source files."
- **Type**: New tool
- **Maturity**: Stable (Danger JS) / Growing (custom Actions)
- **Effort**: Medium (1-4hr)
- **Priority**: P2 (nice to have)
- **Bun compatible**: Yes
- **Pros**:
  - Programmable rules specific to this repo's conventions
  - Can warn vs. fail (non-blocking suggestions)
  - Checks changeset presence, test coverage delta, etc.
- **Cons**:
  - Requires custom JS/TS rule authoring
  - Another dependency to maintain
- **Conflicts with**: None

---

### 4. Turborepo Optimization

### 4.1 Fix `lint` Task Dependencies

- **What**: Remove `^lint` dependency from the `lint` task
- **Why**: `dependsOn: ["^lint"]` forces cascading lint execution through the dependency graph. Lint tasks are leaf operations -- they only need the source files of the current package, not linted dependencies. This slows lint by serializing it unnecessarily.
- **Type**: Config upgrade
- **Maturity**: Stable
- **Effort**: Low (< 1hr)
- **Priority**: P0 (must-have)
- **Bun compatible**: Yes
- **Pros**:
  - Lint tasks run in parallel across all packages simultaneously
  - Significant speedup (lint is typically the most parallelizable task)
  - Follows Turborepo official recommendation
- **Cons**:
  - None -- lint does not depend on downstream lint results
- **Conflicts with**: None
- **Config snippet**:
```jsonc
// turbo.json
{
  "tasks": {
    "lint": {
      "cache": true,
      "dependsOn": [],  // was ["^lint"] -- lint is independent
      "inputs": ["$TURBO_DEFAULT$"]
    },
    "lint:fix": {
      "cache": false,  // fixes should not be cached
      "dependsOn": []
    }
  }
}
```

### 4.2 Add `test` Task

- **What**: Define a proper `test` task in turbo.json for per-package test caching
- **Why**: Tests currently bypass Turborepo entirely (`npx vitest run` at root). This means no caching, no affected-only testing, no parallelization across the task graph. Each package should have its own vitest config and `test` script.
- **Type**: Config upgrade
- **Maturity**: Stable
- **Effort**: Medium (1-4hr) -- requires per-package vitest configs
- **Priority**: P0 (must-have)
- **Bun compatible**: Yes
- **Pros**:
  - Tests are cached per-package -- unchanged packages skip tests entirely
  - `--affected` works for tests
  - Integrates with remote cache for CI speedup
  - Proper task graph: `test` depends on `^build` (needs compiled deps)
- **Cons**:
  - Requires migrating from root vitest workspace to per-package configs
  - Coverage merging requires extra setup
- **Conflicts with**: Current root-level vitest workspace approach (requires migration)
- **Config snippet**:
```jsonc
// turbo.json addition
{
  "tasks": {
    "test": {
      "cache": true,
      "dependsOn": ["^build"],
      "inputs": [
        "$TURBO_DEFAULT$",
        "vitest.config.*"
      ],
      "outputs": ["coverage/**"]
    },
    "test:watch": {
      "cache": false,
      "persistent": true,
      "dependsOn": ["^build"]
    }
  }
}
```

Per-package `package.json`:
```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

### 4.3 Remote Caching via `rharkor/caching-for-turbo`

- **What**: Use GitHub Actions' built-in cache as Turborepo's remote cache (no Vercel account needed)
- **Why**: Remote caching shares build artifacts across CI runs and developers. This repo already declares `TURBO_TOKEN`/`TURBO_TEAM` in globalEnv but has no remote cache configured. The `rharkor/caching-for-turbo` action is the simplest path -- it spins up a local cache server in CI that bridges to GitHub's cache service.
- **Type**: New tool
- **Maturity**: Growing (community-maintained, well-adopted)
- **Effort**: Low (< 1hr)
- **Priority**: P1 (high value)
- **Bun compatible**: Yes
- **Pros**:
  - Zero external services (uses GitHub's free 10GB cache)
  - Automatic `TURBO_API`, `TURBO_TOKEN`, `TURBO_TEAM` environment setup
  - Works with existing turbo.json -- no config changes needed
  - Typical 30-50% CI speedup on cache hits
- **Cons**:
  - GitHub cache is per-repo, 10GB limit (may evict old entries)
  - Not as fast as Vercel's CDN-backed cache for large artifacts
  - Community-maintained (not official Turborepo)
- **Conflicts with**: Vercel remote cache (use one or the other)
- **Config snippet**:
```yaml
# In CI workflow
- name: Setup Turborepo cache
  uses: rharkor/caching-for-turbo@v1
```

### 4.4 Alternative: `ducktors/turborepo-remote-cache` (Self-Hosted)

- **What**: Self-hosted Turborepo remote cache server with S3/GCS/Azure/local storage
- **Why**: For teams needing larger cache, cross-repo sharing, or on-prem requirements.
- **Type**: New tool
- **Maturity**: Stable (used in production at Mercari and others)
- **Effort**: High (4hr+) -- requires infrastructure (Docker/server)
- **Priority**: P2 (nice to have)
- **Bun compatible**: Yes
- **Pros**:
  - Unlimited cache size (depends on storage backend)
  - Cross-repo cache sharing
  - Docker image available on Docker Hub
  - 50% build time reduction reported by Mercari
- **Cons**:
  - Requires hosting infrastructure (server, storage backend)
  - More operational overhead than GitHub cache approach
  - Needs token/auth management
- **Conflicts with**: `rharkor/caching-for-turbo` (use one or the other)

### 4.5 Use `--affected` in CI

- **What**: Run Turborepo tasks with `--affected` flag in PR CI workflows
- **Why**: Without `--affected`, every PR runs lint/test/build for ALL packages even when only one changed. The `--affected` flag uses git diff to determine which packages changed and runs tasks only for those packages plus their dependents.
- **Type**: Config upgrade
- **Maturity**: Stable (since Turborepo 2.2)
- **Effort**: Low (< 1hr)
- **Priority**: P0 (must-have)
- **Bun compatible**: Yes
- **Pros**:
  - Dramatic CI speedup for PRs touching few packages
  - Automatic dependent inclusion (changing `common` also tests `cli` and `web`)
  - Auto-detects PR context in GitHub Actions via `GITHUB_BASE_REF`
- **Cons**:
  - Requires `fetch-depth: 0` in checkout for accurate git diff
  - Full runs still needed on main branch pushes
- **Conflicts with**: None
- **Config snippet**:
```yaml
# In CI check workflow for PRs
- name: Lint (affected only)
  run: npx turbo lint --affected

- name: Typecheck (affected only)
  run: npx turbo build check --affected

- name: Test (affected only)
  run: npx turbo test --affected
```

For main branch pushes (no `--affected`):
```yaml
- name: Lint (all)
  run: npx turbo lint

- name: Typecheck (all)
  run: npx turbo build check

- name: Test (all)
  run: npx turbo test
```

---

### 5. GitHub Actions Optimization

### 5.1 Create `check.yml` CI Workflow

- **What**: A comprehensive PR check workflow with lint, typecheck, test, and quality gates
- **Why**: **The single most critical gap in this repo.** There are zero PR quality gates -- any code can be merged without passing lint, typecheck, or tests. This is the highest-priority item in this entire document.
- **Type**: New tool
- **Maturity**: Stable
- **Effort**: Medium (1-4hr)
- **Priority**: P0 (must-have)
- **Bun compatible**: Yes
- **Pros**:
  - Prevents broken code from reaching main
  - Required status checks block merges on failure
  - Automated quality enforcement for all contributors
  - Pairs with Turborepo caching for fast feedback
- **Cons**:
  - CI minutes cost (mitigated by caching and `--affected`)
- **Conflicts with**: None
- **Config snippet**:
```yaml
# .github/workflows/check.yml
name: Check

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: ${{ startsWith(github.ref, 'refs/pull/') }}

permissions:
  contents: read
  pull-requests: write

jobs:
  check:
    name: Lint, Typecheck & Test
    runs-on: ubuntu-latest
    timeout-minutes: 20

    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 0  # needed for --affected

      - name: Setup Bun
        uses: oven-sh/setup-bun@v2
        with:
          bun-version-file: .bun-version

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version-file: .nvmrc  # use .nvmrc instead of hardcoded 20

      - name: Setup Turborepo cache
        uses: rharkor/caching-for-turbo@v1

      - name: Install dependencies
        run: bun install --frozen-lockfile

      - name: Lint
        run: npx turbo lint ${{ github.event_name == 'pull_request' && '--affected' || '' }}

      - name: Typecheck
        run: npx turbo build check ${{ github.event_name == 'pull_request' && '--affected' || '' }}

      - name: Test
        run: npx turbo test ${{ github.event_name == 'pull_request' && '--affected' || '' }}

      - name: Type tests
        run: bun run test:types
```

### 5.2 Bun Dependency Caching

- **What**: Cache Bun's global install cache across CI runs
- **Why**: `bun install` is already fast but caching saves 5-15s per run. The text lockfile (`bun.lock`, present in this repo) provides a stable cache key.
- **Type**: Config upgrade
- **Maturity**: Stable
- **Effort**: Low (< 1hr)
- **Priority**: P1 (high value)
- **Bun compatible**: Yes
- **Pros**:
  - Saves 5-15s per CI run
  - Uses standard GitHub Actions cache
  - `bun.lock` (text format) provides reliable cache invalidation
- **Cons**:
  - `bun install` is already very fast; marginal improvement
  - Uses cache storage quota (but Bun cache is small)
- **Conflicts with**: None
- **Config snippet**:
```yaml
- name: Cache Bun dependencies
  uses: actions/cache@v4
  with:
    path: ~/.bun/install/cache
    key: bun-${{ runner.os }}-${{ hashFiles('bun.lock') }}
    restore-keys: |
      bun-${{ runner.os }}-
```

Note: As of 2025, `oven-sh/setup-bun@v2` does not have a built-in `cache` option like `actions/setup-node`. The manual `actions/cache` step is the recommended approach.

### 5.3 Fix Node Version Mismatch

- **What**: Use `node-version-file: .nvmrc` instead of hardcoded `node-version: 20`
- **Why**: `.nvmrc` says 22 but CI uses Node 20. Using `node-version-file` eliminates the mismatch and keeps CI in sync with local dev.
- **Type**: Config upgrade
- **Maturity**: Stable
- **Effort**: Low (< 1hr)
- **Priority**: P0 (must-have)
- **Bun compatible**: Yes
- **Pros**:
  - Single source of truth for Node version
  - Eliminates version mismatch bugs
- **Cons**: None
- **Conflicts with**: None
- **Config snippet**:
```yaml
- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version-file: .nvmrc
```

### 5.4 `actions/dependency-review-action`

- **What**: Scans PR dependency changes for known vulnerabilities and license issues
- **Why**: No security scanning exists in CI. The 2025 GitHub Actions supply chain attacks (tj-actions/changed-files CVE-2025-30066) demonstrate the risk. This action is first-party GitHub, free, and catches vulnerable dependencies before they land on main.
- **Type**: New tool
- **Maturity**: Stable (GitHub first-party)
- **Effort**: Low (< 1hr)
- **Priority**: P1 (high value)
- **Bun compatible**: Yes (scans lockfile, language-agnostic)
- **Pros**:
  - Zero config needed
  - Free for all GitHub repos
  - Catches CVEs in new/updated dependencies
  - License compliance checking
  - First-party GitHub action (no supply chain risk)
- **Cons**:
  - Only checks dependency changes in PRs (not existing deps)
  - Requires `contents: read` permission
- **Conflicts with**: None
- **Config snippet**:
```yaml
# .github/workflows/dependency-review.yml
name: Dependency Review
on: pull_request

permissions:
  contents: read

jobs:
  review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/dependency-review-action@v4
        with:
          fail-on-severity: high
          deny-licenses: AGPL-3.0, GPL-3.0
          comment-summary-in-pr: always
```

### 5.5 Concurrency Control

- **What**: Add concurrency groups to cancel outdated CI runs on PR updates
- **Why**: Without concurrency control, pushing multiple commits to a PR triggers multiple full CI runs that all run to completion, wasting minutes and delaying feedback.
- **Type**: Config upgrade
- **Maturity**: Stable
- **Effort**: Low (< 1hr)
- **Priority**: P1 (high value)
- **Bun compatible**: Yes
- **Pros**:
  - Saves CI minutes (can cut 10% of Actions spending)
  - Faster feedback (only latest commit runs)
  - Prevents resource contention
- **Cons**:
  - Must be `cancel-in-progress: false` for deployment workflows
- **Conflicts with**: None
- **Config snippet**:
```yaml
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: ${{ startsWith(github.ref, 'refs/pull/') }}
```

### 5.6 Pin Actions by SHA

- **What**: Pin all third-party GitHub Actions to full commit SHAs instead of version tags
- **Why**: The tj-actions/changed-files supply chain attack (CVE-2025-30066, March 2025) compromised 23,000+ repos by injecting malicious code through a mutable tag. Pinning to SHAs prevents tag hijacking.
- **Type**: Config upgrade
- **Maturity**: Stable (CISA recommendation)
- **Effort**: Low (< 1hr)
- **Priority**: P1 (high value)
- **Bun compatible**: N/A
- **Pros**:
  - Prevents supply chain attacks via mutable tags
  - Reproducible builds (exact code, no surprises)
  - Recommended by CISA, OpenSSF, GitHub Security
- **Cons**:
  - Harder to read (SHA vs. version tag)
  - Manual updates needed (mitigated by Dependabot/Renovate)
- **Conflicts with**: None
- **Config snippet**:
```yaml
# Instead of:
- uses: actions/checkout@v4
# Use:
- uses: actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683 # v4.2.2
```

---

### 6. Changesets Audit & Improvements

### 6.1 Switch to `@changesets/changelog-github`

- **What**: Replace default changelog generator with GitHub-aware version that links PRs, commits, and authors
- **Why**: Current default generator (`@changesets/cli/changelog`) produces plain text entries with no links. The GitHub variant auto-links PR numbers, commit SHAs, and contributor usernames, making changelogs more useful and navigable.
- **Type**: Config upgrade
- **Maturity**: Stable (official changesets package)
- **Effort**: Low (< 1hr)
- **Priority**: P1 (high value)
- **Bun compatible**: Yes
- **Pros**:
  - Auto-links PRs, commits, and contributors in CHANGELOG.md
  - Official first-party package (same maintainers)
  - Drop-in replacement, no config migration
- **Cons**:
  - Requires `GITHUB_TOKEN` during versioning (already available in CI)
  - Links are GitHub-specific (not portable to other forges)
- **Conflicts with**: `changesets-format-with-issue-links` (use one or the other)
- **Config snippet**:
```bash
bun add -D @changesets/changelog-github
```
```jsonc
// .changeset/config.json
{
  "changelog": ["@changesets/changelog-github", { "repo": "kriegcloud/beep-effect" }]
}
```

### 6.2 Install changeset-bot GitHub App

- **What**: GitHub App that comments on PRs about missing/present changesets
- **Why**: No automated changeset reminders exist. Contributors (especially AI agents) may forget to add changesets. The bot provides a non-blocking comment with a direct link to add one.
- **Type**: New tool
- **Maturity**: Stable (official changesets project)
- **Effort**: Low (< 1hr) -- just install the GitHub App
- **Priority**: P1 (high value)
- **Bun compatible**: Yes (language-agnostic)
- **Pros**:
  - Zero config (just install the GitHub App)
  - Non-blocking (comments, does not fail checks)
  - Provides direct link to create changeset
  - Reminds contributors without nagging
- **Cons**:
  - Third-party GitHub App (requires trust)
  - Comments on every PR, even those that legitimately need no changeset
- **Conflicts with**: None
- **Install**: Go to https://github.com/apps/changeset-bot and install on the repository

### 6.3 Add `linked` Groups for Coordinated Releases

- **What**: Configure `linked` in changeset config for packages that should share version bumps
- **Why**: If `@beep/common` and `@beep/shared` are always released together or are tightly coupled, `linked` ensures they get the same version bump when either changes. Currently `linked: []` and `fixed: []` are both empty.
- **Type**: Config upgrade
- **Maturity**: Stable
- **Effort**: Low (< 1hr)
- **Priority**: P2 (nice to have)
- **Bun compatible**: Yes
- **Pros**:
  - Coordinated version bumps for related packages
  - Prevents version drift between tightly coupled packages
- **Cons**:
  - Unnecessary if packages are truly independent
  - Over-linking causes unnecessary version bumps
- **Conflicts with**: None
- **Config snippet**:
```jsonc
// .changeset/config.json (only if packages are coupled)
{
  "linked": [["@beep/common", "@beep/shared"]]
}
```

---

## Implementation Priority

### Phase 1: Critical Gaps (Week 1)
| # | Item | Effort | Impact |
|---|------|--------|--------|
| 1 | Create `check.yml` CI workflow (5.1) | Medium | Blocks broken code from main |
| 2 | Fix `lint` task dependencies (4.1) | Low | Immediate lint speedup |
| 3 | Add `test` task to turbo.json (4.2) | Medium | Enables test caching |
| 4 | Fix Node version mismatch (5.3) | Low | Eliminates version bugs |
| 5 | Remove orphaned `.lintstagedrc.json` (1.4) | Low | Cleanup |
| 6 | Use `stage_fixed` in lefthook (1.1) | Low | Safer pre-commit |

### Phase 2: Quality & Speed (Week 2)
| # | Item | Effort | Impact |
|---|------|--------|--------|
| 7 | Add commitlint + commit-msg hook (1.2, 2.1) | Low | Consistent commit messages |
| 8 | Use `--affected` in CI (4.5) | Low | Faster PR CI |
| 9 | Setup Turborepo remote cache (4.3) | Low | Cross-run cache sharing |
| 10 | Add dependency review action (5.4) | Low | Security scanning |
| 11 | Add concurrency control (5.5) | Low | Save CI minutes |
| 12 | Switch to changelog-github (6.1) | Low | Better changelogs |

### Phase 3: Polish (Week 3)
| # | Item | Effort | Impact |
|---|------|--------|--------|
| 13 | Install changeset-bot (6.2) | Low | PR changeset reminders |
| 14 | Add PR size labeler (3.1) | Low | Visual PR quality |
| 15 | Pin actions by SHA (5.6) | Low | Supply chain security |
| 16 | Optimize pre-push hook (1.3) | Low | Faster local pushes |
| 17 | Bun dependency caching (5.2) | Low | Marginal CI speedup |
| 18 | Add linked changeset groups (6.3) | Low | Coordinated releases |

---

## Complete Recommended Lefthook Config

```yaml
# lefthook.yml
pre-commit:
  parallel: true
  commands:
    biome:
      glob: "*.{ts,tsx,js,jsx,json,jsonc,css,md}"
      run: bunx biome check --write {staged_files}
      stage_fixed: true
    jsdoc:
      glob: "tooling/*/src/**/*.ts"
      exclude: "tooling/*/src/internal/**|tooling/_test-*/src/**|**/*.test.ts|**/*.spec.ts|**/*.d.ts"
      run: npx eslint --config eslint.config.mjs --ignore-pattern 'tooling/_test-*/**' {staged_files}

commit-msg:
  commands:
    commitlint:
      run: bunx commitlint --edit {1}

pre-push:
  parallel: true
  commands:
    typecheck:
      run: npx turbo build check --affected
    test:
      run: npx vitest run --changed
```

## Complete Recommended turbo.json

```jsonc
{
  "$schema": "https://turborepo.com/schema.json",
  "ui": "tui",
  "globalDependencies": [
    "**/.env",
    "**/.env.*",
    "tsconfig.json",
    "tsconfig.base.json",
    "tsconfig.packages.json"
  ],
  "globalPassThroughEnv": ["NODE_TLS_REJECT_UNAUTHORIZED", "AWS_*", "SST_*"],
  "tasks": {
    "build": {
      "persistent": false,
      "cache": true,
      "dependsOn": ["^build"],
      "inputs": ["$TURBO_DEFAULT$", ".env*"],
      "outputs": [
        "dist/**",
        "build/**",
        ".next/**",
        "next-env.d.ts",
        ".expo/**",
        "_next/**",
        ".output/**",
        ".vercel/output/**",
        "**/.tsbuildinfo/**",
        "!**/.turbo/**",
        "!.next/cache/**"
      ]
    },
    "lint": {
      "cache": true,
      "dependsOn": [],
      "inputs": ["$TURBO_DEFAULT$"]
    },
    "lint:fix": {
      "cache": false,
      "dependsOn": []
    },
    "check": {
      "dependsOn": ["^build", "^check"],
      "inputs": ["$TURBO_DEFAULT$"]
    },
    "test": {
      "cache": true,
      "dependsOn": ["^build"],
      "inputs": ["$TURBO_DEFAULT$", "vitest.config.*"],
      "outputs": ["coverage/**"]
    },
    "test:watch": {
      "cache": false,
      "persistent": true,
      "dependsOn": ["^build"]
    },
    "docgen": {
      "cache": true,
      "dependsOn": ["^docgen"],
      "inputs": ["$TURBO_DEFAULT$"],
      "outputs": ["docs/**", "dtslint/**"]
    }
  }
}
```

## References

- [Lefthook GitHub](https://github.com/evilmartians/lefthook) | [Docs](https://lefthook.dev/)
- [Lefthook commitlint example](https://lefthook.dev/examples/commitlint.html)
- [Lefthook stage_fixed docs](https://lefthook.dev/configuration/stage_fixed.html)
- [5 Cool Ways to Configure Lefthook (Evil Martians)](https://evilmartians.com/chronicles/5-cool-and-surprising-ways-to-configure-lefthook-for-automation-joy)
- [commitlint docs](https://commitlint.js.org/reference/configuration.html)
- [commitlint-plugin-workspace-scopes](https://www.npmjs.com/package/commitlint-plugin-workspace-scopes)
- [Turborepo Task Graph Docs](https://turborepo.dev/docs/core-concepts/package-and-task-graph)
- [Turborepo Configuring Tasks](https://turborepo.dev/docs/crafting-your-repository/configuring-tasks)
- [Turborepo Vitest Guide](https://turborepo.dev/docs/guides/tools/vitest)
- [Turborepo --affected in CI](https://rebeccamdeprey.com/blog/using-the-turborepo---affected-flag-in-ci)
- [Turborepo Constructing CI](https://turborepo.dev/docs/crafting-your-repository/constructing-ci)
- [Turborepo GitHub Actions Guide](https://turborepo.dev/docs/guides/ci-vendors/github-actions)
- [rharkor/caching-for-turbo](https://github.com/rharkor/caching-for-turbo)
- [ducktors/turborepo-remote-cache](https://github.com/ducktors/turborepo-remote-cache)
- [Mercari Turborepo Remote Cache (2026)](https://engineering.mercari.com/en/blog/entry/20260216-turborepo-remote-cache-accelerating-ci-to-move-fast/)
- [oven-sh/setup-bun](https://github.com/oven-sh/setup-bun)
- [Bun CI/CD Guide](https://bun.com/docs/guides/runtime/cicd)
- [GitHub Actions Concurrency (OneUpTime)](https://oneuptime.com/blog/post/2025-12-20-concurrency-control-github-actions/view)
- [Cancelling In-Progress PR Workflows (General Reasoning)](https://generalreasoning.com/blog/2025/02/05/github-actions-concurrency.html)
- [actions/dependency-review-action](https://docs.github.com/en/code-security/supply-chain-security/understanding-your-software-supply-chain/configuring-the-dependency-review-action)
- [GitHub Supply Chain Security](https://github.com/security/advanced-security/software-supply-chain)
- [OpenSSF: Securing CI/CD After tj-actions Attack](https://openssf.org/blog/2025/06/11/maintainers-guide-securing-ci-cd-pipelines-after-the-tj-actions-and-reviewdog-supply-chain-attacks/)
- [cbrgm/pr-size-labeler-action](https://github.com/cbrgm/pr-size-labeler-action)
- [Changesets GitHub](https://github.com/changesets/changesets)
- [Changesets Changelog Format Docs](https://github.com/changesets/changesets/blob/main/docs/modifying-changelog-format.md)
- [@changesets/changelog-github](https://www.npmjs.com/package/@changesets/changelog-github)
- [changeset-bot GitHub App](https://github.com/apps/changeset-bot)
- [spautz/changesets-changelog-format](https://github.com/spautz/changesets-changelog-format)
- [Monorepo CI Optimization (WarpBuild)](https://www.warpbuild.com/blog/github-actions-monorepo-guide)
