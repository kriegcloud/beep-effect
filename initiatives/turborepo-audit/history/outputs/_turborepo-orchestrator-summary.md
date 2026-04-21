# Root command inventory

The root `package.json` is already Turbo-first for the common workflows:
- Turbo delegates: `dev`, `build`, `build:ci`, `check`, `check:infra`, `test`, `lint`, `lint:fix`, `storybook`, `build-storybook`, `test:storybook`, `docgen`, `docgen:affected`
- Repo CLI wrappers: `topo-sort`, `codegen`, `create-package`, `config-sync`, `version-sync`, `purge`, `graphiti:proxy`, schema/effect-law helper commands
- Direct tools: `check:full`, `lint:jsdoc`, `lint:effect-laws`, `lint:repo`, `lint:ox`, `lint:spell`, `lint:markdown`, `lint:typos`, `coverage`, `changeset`, `deps:update`
- Ops / utilities: `services:up`, `nuke`, proxy helpers, release/audit helpers

The root surface is healthiest where it is a thin Turbo entrypoint. It becomes harder to reason about when a single script mixes Turbo work with follow-up root orchestration, especially:
- `test`: Turbo package tests plus root `test:types`
- `lint`: Turbo lanes plus root governance and direct-tool checks
- `docgen`: Turbo package docgen plus root docs aggregation

# GitHub Actions to Turbo task mapping

`check.yml` already maps well to the main task graph:
- `build` job -> `bunx turbo run build $TURBO_ARGS`
- `lint` job -> `bunx turbo run lint lint:effect-laws lint:jsdoc lint:spell lint:markdown lint:circular lint:versions $TURBO_ARGS`
- `check` job -> `bunx turbo run check $TURBO_ARGS`
- `test` job -> `bunx turbo run test $TURBO_ARGS --concurrency=1` plus root `test:types`
- `docgen` job -> `bunx turbo run docgen $TURBO_ARGS` plus root docs aggregation
- `repo-sanity` job -> non-Turbo repo governance and policy checks
- `full-check` job -> direct root `check:full`

Other workflows are less graph-native:
- `release.yml` validates through root `release`, which chains `build`, `test`, and `lint` before `changeset publish`
- `data-sync.yml` uses targeted direct commands instead of Turbo-backed package tasks

Across the core Turbo jobs, CI already does three important things correctly:
- full-history checkout with `fetch-depth: 0`
- Turbo cache credentials via `TURBO_TOKEN` and `TURBO_TEAM`
- `.turbo/cache` reuse per job

# Highest-leverage optimization opportunities

1. Move PR execution from `--filter=...[origin/main]` toward `--affected` and `turbo query affected`.
This is the clearest repo-wide modernization win because the workflow already has full Git history and a healthy task graph.

2. Thin compound root scripts.
Keep the stable root DX, but reduce cases where root scripts hide extra post-processing outside the graph, especially `lint`, `test`, and `docgen`.

3. Pull obvious deterministic root checks into clearer Turbo-backed ownership.
`lint:ox` is the best first candidate because it is currently a direct root command with no graph visibility.

4. Model native app build surfaces more explicitly.
The repo is genuinely multi-language, but `build:native` and `build:sidecar` are still not first-class cached Turbo tasks with declared outputs.

5. Start using Turbo’s native graph introspection in daily workflows.
`turbo query ls` and `turbo query affected` already work in this repo and can replace some bespoke graph-discovery habits.

# Potential anti-patterns or unnecessary complexity

- Repeating checkout / setup / install / cache steps across `build`, `lint`, `check`, `test`, and `docgen` jobs in `check.yml`
- Compound root scripts that make it unclear which work is actually in the Turbo graph
- Maintaining custom graph-discovery tooling such as `topo-sort` without also using Turbo’s native `query` / `ls` surfaces
- Broad `globalPassThroughEnv` that is operationally convenient but deserves periodic cache-safety review
- Leaving deploy-readiness features like `turbo prune` completely dormant once an app-specific packaging path appears

Not everything should churn:
- Biome, TypeScript, and Vitest are already strongly aligned with Turbo guidance
- `@beep/ui` is the right shared owner for shadcn, Tailwind v4, and Storybook
- Docker is sensibly local-infra only today and does not need forced Turbo integration yet
- Some repo-wide governance checks should remain outside package tasks if package scoping would be artificial

# Suggested execution order

1. Prototype `--affected` or `turbo query affected` in `check.yml` for `build`, `check`, `test`, `lint`, and `docgen`.
2. Normalize the root script surface by documenting or splitting Turbo entrypoints vs repo-governance vs ops utilities.
3. Pull `lint:ox` and the `docgen` aggregation tail into clearer task boundaries where outputs and ownership are explicit.
4. Add package-level `turbo.json` overrides only where packages truly diverge, especially native app build surfaces.
5. Introduce Turbo-native graph and generator features selectively: `query`/`ls` first, thin generators later, boundaries/tags only after a taxonomy is agreed.
6. Revisit deploy-oriented `prune` only when a real Docker or app-packaging path exists.

# Open questions

- Is signed remote-cache verification (`remoteCache.signature: true`) a required security control for this repo or only a future hardening step?
- Which repo-governance checks should remain root-only by design, and which ones should become graph-visible Turbo tasks?
- Should Tauri-native outputs and Bun sidecar builds become first-class Turbo tasks now, or only when their build cost becomes material?
- What package tag taxonomy would actually help if Turbo boundaries are piloted: app vs shared-runtime vs tooling, or something more domain-specific?
- Should `data-sync.yml` stay intentionally narrow and direct, or be made more uniform with package-task execution once the broader root surface is normalized?
