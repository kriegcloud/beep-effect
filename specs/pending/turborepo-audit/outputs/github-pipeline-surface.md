## Topic

GitHub pipeline surface

## TLDR

The main `check.yml` workflow already uses Turbo in the places that matter, but the overall GitHub Actions surface is still more duplicated than it needs to be. Build, lint, check, test, and docgen each repeat the same setup/cache/install steps and still rely on `--filter=...[origin/main]` rather than newer affected-first selection. Release and data-sync workflows also bypass Turbo for parts of their validation even when the underlying packages already expose package tasks.

## Score

0.73 (`mixed`)

## Current repo evidence

- `.github/workflows/check.yml` uses Turbo for the main package-scoped quality lanes:
  - `build`: `bunx turbo run build $TURBO_ARGS`
  - `lint`: `bunx turbo run lint lint:effect-laws lint:jsdoc lint:spell lint:markdown lint:circular lint:versions $TURBO_ARGS`
  - `check`: `bunx turbo run check $TURBO_ARGS`
  - `test`: `bunx turbo run test $TURBO_ARGS --concurrency=1`
  - `docgen`: `bunx turbo run docgen $TURBO_ARGS`
- PR filtering in `check.yml` is centralized as `TURBO_ARGS: ${{ github.event_name == 'pull_request' && '--filter=...[origin/main]' || '' }}`.
- `check.yml` passes `TURBO_TOKEN` and `TURBO_TEAM` and caches `.turbo/cache` per job, which means the CI shape is already remote-cache aware.
- `repo-sanity` in `check.yml` runs a separate non-Turbo stack: `check:effect-laws-allowlist`, `lint:tooling-tagged-errors`, `lint:schema-first`, `lint:typos`, `lint:repo`, `lint:ox`, `audit:high:ci`, and `bunx syncpack lint`.
- `full-check` in `check.yml` bypasses Turbo entirely with `bun run check:full`.
- `.github/workflows/release.yml` installs dependencies and then relies on `bun run changeset:version` and `bun run release`, where `release` chains `bun run build && bun run test && bun run lint && changeset publish`.
- `.github/workflows/data-sync.yml` uses direct commands for a focused path:
  - `bun run beep sync-data-to-ts --all`
  - `bunx tsc -p tooling/cli/tsconfig.json --noEmit`
  - `bunx --bun vitest run tooling/cli/test/sync-data-to-ts.test.ts`
  - `bunx tsc -p packages/common/data/tsconfig.json --noEmit`
  - `bunx --bun vitest run packages/common/data/test/currency-codes.test.ts`
- The repo task graph is real and broad. `bunx turbo query ls --output json` reports 43 packages, so the CI surface has meaningful graph information available to it.

## Official Turborepo guidance

- Turborepo’s GitHub Actions guidance centers on running repository workflows through Turbo, using cache-aware CI jobs, and taking advantage of remote caching in CI: https://turborepo.dev/docs/guides/ci-vendors/github-actions
- The CI design guidance emphasizes avoiding repeated work by leaning on the task graph rather than duplicating setup and execution logic in separate jobs: https://turborepo.dev/docs/crafting-your-repository/constructing-ci
- Modern graph introspection and affected analysis live in Turbo’s query surface, which is the right direction for task-aware CI refinement beyond broad package filters: https://turborepo.dev/docs/reference/query
- Turbo’s running-tasks guidance still assumes that the healthiest CI surfaces are the ones that map closely to real package tasks instead of bespoke root scripts: https://turborepo.dev/docs/crafting-your-repository/running-tasks

## Gaps or strengths

- Strength: the main CI lanes already map to the primary Turbo tasks, so the workflow is not fighting the task graph.
- Strength: remote-cache prerequisites are present in `check.yml`, including `TURBO_TOKEN`, `TURBO_TEAM`, and `.turbo/cache`.
- Gap: the job scaffolding in `check.yml` is highly repetitive. Checkout, Bun/Node setup, dependency install, and cache steps are duplicated across build, lint, check, test, and docgen.
- Gap: PR scoping is still package-filter based, not task-aware affected analysis. That is good enough to work, but it is not the sharpest current Turbo path.
- Gap: the non-Turbo `repo-sanity` lane means the CI surface is split between a Turbo world and a root-utility world, which makes overall CI cost and ownership harder to reason about.
- Gap: release and data-sync validation rely on direct root or targeted commands even where existing package tasks could make the workflow shape more uniform.
- Justified tradeoff: `repo-sanity` contains some truly repo-wide policy checks that may not belong inside package tasks if package scoping would be artificial.

## Improvement or preservation plan

1. Preserve the current Turbo-backed job separation for build, lint, check, test, and docgen. Those lanes already map cleanly to the repo task graph.
2. Modernize PR selection first by evaluating `--affected` and `turbo query`-driven task selection in place of the current `--filter=...[origin/main]` baseline.
3. Reduce job duplication in `check.yml` with shared workflow steps or a reusable composite action for checkout/setup/install/cache, while keeping the task-specific execution lines explicit.
4. Audit `repo-sanity` command-by-command and move only the clearly deterministic, graph-friendly checks into Turbo-backed tasks. Keep the truly global policy checks separate and documented as such.
5. Revisit `release.yml` and `data-sync.yml` after the task surface is normalized. Prefer package-task execution where it improves consistency without hiding purpose-built release or data-generation logic.

## Commands and files inspected

- `sed -n '1,260p' .github/workflows/check.yml`
- `sed -n '1,260p' .github/workflows/release.yml`
- `sed -n '1,260p' .github/workflows/data-sync.yml`
- `node -e 'const p=require("./package.json"); console.log(JSON.stringify({scripts:p.scripts}, null, 2))'`
- `node <<'NODE' ... classify root scripts ... NODE`
- `bunx turbo query ls --output json`
- `package.json`
- `turbo.json`

## Sources

- Repo:
  - `.github/workflows/check.yml`
  - `.github/workflows/release.yml`
  - `.github/workflows/data-sync.yml`
  - `package.json`
  - `turbo.json`
  - `bunx turbo query ls --output json`
- Official Turborepo:
  - https://turborepo.dev/docs/guides/ci-vendors/github-actions
  - https://turborepo.dev/docs/crafting-your-repository/constructing-ci
  - https://turborepo.dev/docs/reference/query
  - https://turborepo.dev/docs/crafting-your-repository/running-tasks
