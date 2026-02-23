# Git Workflow & CI Optimization

## Current State
- Active local hooks are Lefthook-based (`lefthook.yml`); `.husky/` is absent.
- `.lintstagedrc.json` exists but hook flow is Lefthook-first, so staged tooling ownership is ambiguous.
- Only release workflow exists (`.github/workflows/release.yml`); no dedicated PR quality gate workflow is present.
- Changesets is configured and used in release flow, but not enforced on feature PRs.
- Current quality: `needs tuning`.

## Recommendations

### Hook Stack Consolidation (Lefthook as Single Source)
- What: Consolidate on Lefthook and remove or explicitly wire `.lintstagedrc.json` to avoid split hook ownership.
- Why: Current setup suggests Husky/lint-staged historically, but runtime behavior is Lefthook; ambiguity causes drift.
- Type: Config upgrade
- Maturity: Stable
- Effort: Low (< 1hr)
- Priority: P0 (must-have)
- Bun compatible: Yes
- Pros: Clear developer behavior, simpler onboarding.
- Cons: Requires one small migration/cleanup PR.
- Conflicts with: Husky/lint-staged dual ownership.
- Config snippet:
```yaml
pre-commit:
  parallel: true
  commands:
    biome:
      run: bunx biome check --write {staged_files}
```

### Commit Message Linting (Conventional Commits)
- What: Add `@commitlint/cli` + `@commitlint/config-conventional` on `commit-msg` hook and CI.
- Why: Standardized commit semantics improve release notes, changesets hygiene, and searchable history.
- Type: New tool
- Maturity: Stable
- Effort: Low (< 1hr)
- Priority: P1 (high value)
- Bun compatible: Partial
- Pros: Predictable commit structure, better automation compatibility.
- Cons: Slight contributor friction at first.
- Conflicts with: None.
- Config snippet:
```js
// commitlint.config.cjs
module.exports = { extends: ["@commitlint/config-conventional"] };
```

### Add PR Check Workflow (Bun + Turbo)
- What: Create `.github/workflows/check.yml` running lint/test/check/build on pull requests.
- Why: Current CI does not block regressions before merge.
- Type: Config upgrade
- Maturity: Stable
- Effort: Medium (1-4hr)
- Priority: P0 (must-have)
- Bun compatible: Yes
- Pros: Prevents broken code landing on `main`.
- Cons: Adds CI minutes and initial tuning effort.
- Conflicts with: None.
- Config snippet:
```yaml
on:
  pull_request:
  push:
    branches: [main]

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
        with:
          bun-version-file: .bun-version
      - run: bun install --frozen-lockfile
      - run: bunx turbo run lint test check build --affected
```

### Turbo + Bun Cache Optimization in CI
- What: Cache Bun install artifacts and Turbo local cache, then connect Turbo remote cache for CI/PRs.
- Why: Monorepo checks will scale better and faster, especially with `--affected` runs.
- Type: Config upgrade
- Maturity: Stable
- Effort: Medium (1-4hr)
- Priority: P1 (high value)
- Bun compatible: Yes
- Pros: Significant CI runtime reduction, less redundant work.
- Cons: Remote cache setup needs token management and policy decisions.
- Conflicts with: None.
- Config snippet:
```yaml
- uses: actions/cache@v4
  with:
    path: |
      ~/.bun/install/cache
      .turbo
    key: ${{ runner.os }}-bun-${{ hashFiles('bun.lock', 'turbo.json') }}
```

### Changesets Enforcement (No Tool Switch)
- What: Keep Changesets and add a PR rule: either a changeset file exists or PR has `no-release` label.
- Why: You already use Changesets; this closes versioning consistency gaps without replacing tooling.
- Type: Config upgrade
- Maturity: Stable
- Effort: Low (< 1hr)
- Priority: P1 (high value)
- Bun compatible: Yes
- Pros: Release discipline with minimal change.
- Cons: Needs team agreement on exceptions.
- Conflicts with: None.
- Config snippet:
```yaml
- name: Changeset status
  run: bun run changeset:status
```

### PR Size / Complexity Guard
- What: Add a PR complexity job using `tj-actions/changed-files` + lightweight thresholds.
- Why: Large monorepo PRs increase review risk and slow cycle time; early labeling helps triage.
- Type: New tool
- Maturity: Stable
- Effort: Low (< 1hr)
- Priority: P2 (nice to have)
- Bun compatible: Yes
- Pros: Better review planning and risk awareness.
- Cons: Needs sensible thresholds to avoid noisy labels.
- Conflicts with: None.
- Config snippet:
```yaml
- uses: tj-actions/changed-files@v47
  id: changed
- run: |
    echo "Changed files: ${{ steps.changed.outputs.all_changed_files_count }}"
```

## Head-to-Head Notes
- Commit message tooling: `commitlint` is the de facto standard for Conventional Commits in JS monorepos.
- Versioning: keep `changesets`; no replacement needed.
- CI diff execution: Turbo `--affected` should be primary for changed-package runs.
