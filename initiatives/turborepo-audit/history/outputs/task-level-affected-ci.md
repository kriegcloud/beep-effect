# Topic
Task-level affected analysis in CI

# TLDR
This is one of the clearest modernization opportunities in the repo. CI is already doing the right broad thing with `--filter=...[origin/main]` and full-history checkouts, but Turbo’s task-level affected analysis is now precise enough that the repo should start migrating hot paths toward `--affected` and `turbo query affected`.

# Score
0.58 / 1.00

# Current repo evidence
- `.github/workflows/check.yml` sets `TURBO_ARGS` to `--filter=...[origin/main]` for pull requests in the `build`, `lint`, `check`, `test`, and `docgen` jobs.
- Those same jobs all use `fetch-depth: 0`, which is exactly what Turbo’s affected analysis needs for Git-history-based comparisons.
- Root `package.json` also has `docgen:affected`, which proves the repo is already comfortable with Git-history-scoped Turbo execution.
- During this audit, `bunx turbo query ls --affected --output json` and `bunx turbo query affected --tasks build check test lint docgen --packages` both ran successfully in the repo.

# Official Turborepo guidance
- `https://turborepo.dev/docs/reference/query` documents `turbo query affected` and says task-level detection is more precise than package-level selection because it uses configured task inputs and dependency edges.
- `https://turborepo.dev/docs/crafting-your-repository/constructing-ci` says CI can use `--affected` to run only changed work when Git history is available.
- The query docs also note that shallow history makes all packages look changed, which reinforces why `fetch-depth: 0` matters.

# Gaps or strengths
- Strength: the repo already has the history depth and Turbo discipline needed to adopt task-level affected analysis safely.
- Strength: current `--filter=...[origin/main]` usage is not wrong; it is a sensible pre-query-era baseline.
- Gap: package-level Git-ref filters are broader than necessary when only some tasks in a package are truly affected.
- Gap: CI still pays repeated setup costs across multiple jobs, so every avoidable task entrypoint matters.

# Improvement or preservation plan
1. Start with the highest-volume lanes in `check.yml`, especially `build`, `check`, `test`, `lint`, and `docgen`.
2. Replace or augment `--filter=...[origin/main]` with `--affected` where the task semantics match and where the CLI behavior stays easy to reason about.
3. Add `turbo query affected` as a diagnostic or gating step when task-level visibility would let the workflow skip empty jobs entirely.
4. Preserve full-history checkout in any job that depends on affected analysis.

# Commands and files inspected
- `sed -n '1,260p' .github/workflows/check.yml`
- `sed -n '1,240p' package.json`
- `bunx turbo query ls --affected --output json`
- `bunx turbo query affected --tasks build check test lint docgen --packages`
- `rg -n 'turbo-ignore|query affected|--filter=\.\.\[origin/main\]|--affected' -S .github turbo.json package.json scripts tooling apps packages infra`

# Sources
- Repo: `.github/workflows/check.yml`
- Repo: `package.json`
- Official Turborepo: `https://turborepo.dev/docs/reference/query`
- Official Turborepo: `https://turborepo.dev/docs/crafting-your-repository/constructing-ci`
