# Topic
Skipping tasks

# TLDR
The repo already skips at the package/filter level in CI, but it still pays the setup cost before Turbo decides what is affected. Turborepo’s newer `turbo query affected` flow is the better target here because it can short-circuit work earlier and can reason about specific tasks, not just changed packages.

# Score
0.74 / 1.00

# Current repo evidence
- `.github/workflows/check.yml:50-53`, `104-107`, `210-213`, `265-268`, and `321-324` set `TURBO_ARGS` to `--filter=...[origin/main]` on pull requests, so build, lint, check, test, and docgen all use the same changed-package filter.
- `.github/workflows/check.yml:63-98`, `109-144`, `223-258`, `277-315`, and `334-360` still perform checkout, Bun/Node setup, dependency install, and cache setup before the filtered Turbo command runs.
- `package.json:95` exposes `docgen:affected`, but it still uses `bunx turbo run docgen --filter=...[origin/main]`, so it is package-scoped skipping rather than task-query skipping.
- `.github/workflows/check.yml:66` and the repeated `fetch-depth: 0` checkout settings mean the repo is already aware that full Git history matters for change detection.
- The workspace search found no use of `turbo-ignore` or `turbo query affected` yet.

# Official Turborepo guidance
- `https://turborepo.dev/docs/guides/skipping-tasks` says to use `turbo query affected` to determine whether a workspace or task is affected before doing the rest of the work.
- That guide recommends a full enough checkout for comparison, calls out `--base` and `--head` customization, and shows `--exit-code` as a quick binary signal.
- The same guide marks `turbo-ignore` as deprecated and recommends `turbo query affected` instead.

# Gaps or strengths
- Strength: the current `--filter=...[origin/main]` usage is already reducing CI scope for pull requests, so the repo is not wasting effort on untouched packages.
- Strength: `fetch-depth: 0` is already in place for the Turbo jobs that need Git history.
- Gap: skip decisions happen after infrastructure setup, so the repo still pays the cost of container boot, package install, and cache wiring before it knows whether a task is needed.
- Gap: the current approach is package-level only, which leaves some room on the table for task-level early exits and more precise CI orchestration.

# Improvement or preservation plan
1. Add a lightweight preflight step that uses `turbo query affected` before the expensive setup in the most expensive PR jobs.
2. Switch the most obvious cases, starting with `check`, `test`, and `docgen`, from a raw `--filter=...[origin/main]` pattern to `turbo query affected` or `--affected` where the command semantics fit.
3. Keep `fetch-depth: 0` or an equivalent full-history checkout anywhere affected analysis is used.
4. Preserve `--filter` only where the package selector is intentionally more expressive or where the job is already minimal enough that the change would not move the needle.

# Commands and files inspected
- `nl -ba .github/workflows/check.yml`
- `nl -ba package.json`
- `bunx turbo query ls`
- `bunx turbo query ls @beep/ui --output json`
- `rg -n "turbo-ignore|query affected|--filter=\\.\\.\\[origin/main\\]|--affected" -S .github turbo.json package.json scripts tooling apps packages infra`

# Sources
- Repo: `.github/workflows/check.yml`
- Repo: `package.json`
- Official Turborepo: `https://turborepo.dev/docs/guides/skipping-tasks`
