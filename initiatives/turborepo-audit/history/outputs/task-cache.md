# Topic
Task cache

# TLDR
The repo’s cache setup is solid and mostly explicit: build and docgen declare outputs, shared Turbo inputs are broad enough to be useful, and CI caches `.turbo/cache` across the main Turbo jobs. The main opportunity is not “add more cache” so much as “keep cacheability intentional” for custom or side-effectful tasks and verify any task that emits files has outputs declared.

# Score
0.88 / 1.00

# Current repo evidence
- `turbo.json:4-16` declares broad `globalDependencies` plus `globalEnv` for `TURBO_TOKEN` and `TURBO_TEAM`, so cache keys are already tied to the repo’s core config and remote-cache identity.
- `turbo.json:37-100` defines cacheable package tasks with explicit outputs for `build`, `docgen`, and `build-storybook`, while `dev`, `dev:desktop`, `storybook`, and `test:storybook` are intentionally uncached because they are persistent or side-effectful.
- `package.json:59-95` delegates the main root surfaces through Turbo, including `build`, `check`, `test`, `lint`, `storybook`, `build-storybook`, `test:storybook`, and `docgen`.
- `.github/workflows/check.yml:78-98`, `124-144`, `238-258`, `293-315`, and `349-360` cache `.turbo/cache` and Bun dependencies across the core CI jobs, so remote/local cache reuse is wired into the main pipeline.
- `package.json:94-95` also splits `docgen` and `docgen:affected`, which gives a direct repo-local example of cache-aware affected execution.

# Official Turborepo guidance
- `https://turborepo.dev/docs/crafting-your-repository/caching` says Turborepo caches deterministic tasks using fingerprints of inputs, stores task outputs in `.turbo/cache`, and needs declared `outputs` to restore generated files on cache hits.
- The same page recommends using `--dry` and `--summarize` when cache behavior is unclear, and it calls out that tasks that are extremely fast, produce huge artifacts, or have their own internal caching may be better left uncached.

# Gaps or strengths
- Strength: build, docgen, and Storybook build outputs are explicitly modeled, which is exactly the kind of signal Turbo needs for reliable restores.
- Strength: uncached persistent tasks are already marked as such instead of being forced into the cache model.
- Strength: CI is already taking advantage of `.turbo/cache`, so the repo is not paying the full rebuild cost every run.
- Gap: some root-level wrappers still hide the actual Turbo task boundary, so the cache story is partly “Turbo plus repo shell scripts” rather than a pure task graph story.
- Gap: custom repo-wide utilities such as `lint:repo`, `lint:ox`, and `lint:versions` are intentionally uncached, which is sensible, but it means their cost is always paid unless they are split or narrowed further.

# Improvement or preservation plan
1. Keep the current explicit `outputs` for `build`, `docgen`, and `build-storybook`; those are the highest-value cache wins and already align with Turbo’s model.
2. Preserve `cache: false` for persistent or side-effectful tasks like `dev`, `storybook`, and `test:storybook` unless a future refactor removes the expensive setup they depend on.
3. When a task starts producing files and is currently uncached or opaque, add a focused `outputs` declaration before trying to optimize anything else.
4. Use `turbo --summarize` or `turbo --dry` when a cache miss looks surprising, rather than broadening inputs preemptively.

# Commands and files inspected
- `bun run codex:hook:session-start`
- `bunx turbo --version`
- `bunx turbo query ls`
- `bunx turbo query ls @beep/ui --output json`
- `nl -ba turbo.json`
- `nl -ba package.json`
- `nl -ba .github/workflows/check.yml`
- `nl -ba packages/common/ui/package.json`

# Sources
- Repo: `turbo.json`
- Repo: `package.json`
- Repo: `.github/workflows/check.yml`
- Repo: `packages/common/ui/package.json`
- Official Turborepo: `https://turborepo.dev/docs/crafting-your-repository/caching`
