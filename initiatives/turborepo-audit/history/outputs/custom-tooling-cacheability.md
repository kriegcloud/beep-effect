# Topic
Caching and performance of custom tooling

# TLDR
The repo’s custom tooling is powerful, but a lot of the expensive root-level work still lives outside clearly modeled Turbo outputs and package-level ownership. The highest-value performance move is to turn more deterministic custom tooling into narrower, explicit Turbo tasks instead of broad root orchestration.

# Score
0.64 / 1.00

# Current repo evidence
- Root `package.json` still runs deterministic repo utilities such as `version-sync`, `docgen`, and docs aggregation through root wrappers rather than package-owned Turbo tasks with explicit outputs.
- `docgen` is split between `bunx turbo run docgen` and a root follow-up step `bun run beep docs aggregate --clean`, which means the total workflow is not represented as one task graph edge.
- `lint:ox`, `lint:repo`, `lint:typos`, and `check:full` are direct root commands outside the Turbo task graph.
- `tooling/cli/src/commands/Codegen.ts`, `TsconfigSync.ts`, `VersionSync/index.ts`, and `Docgen/index.ts` all implement deterministic repo-tooling flows, but only some of them are exposed as package tasks.
- `bunx turbo query ls @beep/repo-cli --output json` shows the repo CLI package already owns cacheable tasks such as `build`, `check`, `docgen`, and `test`, so the repo has the package-task pattern available.

# Official Turborepo guidance
- `https://turborepo.dev/docs/crafting-your-repository/configuring-tasks` emphasizes expressing work as tasks so Turbo can parallelize and cache it.
- `https://turborepo.dev/docs/crafting-your-repository/caching` says generated files need explicit `outputs` to be restored on cache hits.
- The docs also caution that not every task should be cached; extremely fast or side-effectful work can be left uncached intentionally.

# Gaps or strengths
- Strength: the repo already distinguishes between cacheable package work and intentionally uncached runtime tasks.
- Strength: the custom tooling surface is mostly deterministic, which means more of it is theoretically cacheable if modeled correctly.
- Gap: several deterministic root workflows still sit outside Turbo or are split between Turbo and post-processing wrappers.
- Gap: repo-wide commands blur package ownership, making it harder to know where `outputs` should be declared and which tasks can safely be narrowed.

# Improvement or preservation plan
1. Start with the deterministic, output-producing flows that are already half-modeled, especially `docgen` plus docs aggregation.
2. Split root wrappers into smaller package or repo-tool tasks with explicit `outputs` where the artifacts are real and stable.
3. Keep fast governance or side-effectful utilities uncached unless profiling says they are worth modeling.
4. Revisit `lint:ox` and similar direct commands next, because they are both measurable and easy to reason about.

# Commands and files inspected
- `sed -n '1,240p' package.json`
- `sed -n '1,260p' tooling/cli/src/commands/Root.ts`
- `sed -n '1,260p' tooling/cli/src/commands/Codegen.ts`
- `sed -n '1,260p' tooling/cli/src/commands/TsconfigSync.ts`
- `sed -n '1,220p' tooling/cli/src/commands/VersionSync/index.ts`
- `sed -n '1,220p' tooling/cli/src/commands/Docgen/index.ts`
- `bunx turbo query ls @beep/repo-cli --output json`

# Sources
- Repo: `package.json`
- Repo: `tooling/cli/src/commands/Root.ts`
- Repo: `tooling/cli/src/commands/Codegen.ts`
- Repo: `tooling/cli/src/commands/TsconfigSync.ts`
- Repo: `tooling/cli/src/commands/VersionSync/index.ts`
- Repo: `tooling/cli/src/commands/Docgen/index.ts`
- Official Turborepo: `https://turborepo.dev/docs/crafting-your-repository/configuring-tasks`
- Official Turborepo: `https://turborepo.dev/docs/crafting-your-repository/caching`
