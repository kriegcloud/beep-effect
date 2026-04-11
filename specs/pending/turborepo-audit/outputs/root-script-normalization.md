# Topic
Root package.json script normalization

# TLDR
The root command surface is already Turbo-first where it matters, but it still mixes clean delegation with policy wrappers, direct tools, and operational utilities in one dense control plane. The normalization goal should be a thinner, more legible root surface rather than a dramatic rewrite.

# Score
0.74 / 1.00

# Current repo evidence
- Root `package.json` cleanly delegates the common developer entrypoints through Turbo: `dev`, `build`, `check`, `test`, `lint`, `storybook`, `build-storybook`, `test:storybook`, and `docgen`.
- The same root file also exposes repo CLI wrappers such as `topo-sort`, `create-package`, `config-sync`, `version-sync`, `graphiti:proxy`, and schema/effect-law lint helpers.
- Direct-tool commands such as `check:full`, `lint:jsdoc`, `lint:effect-laws`, `lint:repo`, `lint:ox`, `lint:spell`, `lint:markdown`, and `lint:typos` still sit beside Turbo delegates.
- Operational utilities like `services:up`, `nuke`, `graphiti:proxy:ensure`, and audit/release helpers live in the same root scripts table.
- A classified script inventory from root `package.json` shows the surface spans Turbo delegates, repo CLI wrappers, direct tools, ops commands, and miscellaneous shell helpers.

# Official Turborepo guidance
- `https://turborepo.dev/docs/crafting-your-repository/running-tasks` recommends writing frequent Turbo commands into the root `package.json` and keeping task execution centered on `turbo run`.
- The docs also say root scripts should be the ergonomic front door for common workflows, while specialized one-off commands can stay outside that core path.

# Gaps or strengths
- Strength: the common DX commands already point people toward Turbo, which is exactly the right default.
- Strength: the repo did not collapse all logic into one giant shell script; package tasks are real and widespread.
- Gap: some root scripts still compose Turbo plus extra post-processing, which obscures where the real task boundary lives.
- Gap: the root script table is large enough that contributor discoverability is starting to compete with clarity.

# Improvement or preservation plan
1. Preserve the stable root front door for `build`, `check`, `test`, `lint`, `dev`, and Storybook/docgen entrypoints.
2. Keep repo CLI wrappers for clearly repo-level operations, but group and document them as governance or maintenance commands rather than everyday DX commands.
3. Thin compound scripts where possible, especially when a root script chains Turbo work with extra post-processing that could become its own task.
4. Avoid adding new specialty wrappers at the root unless they improve discoverability more than they increase orchestration complexity.

# Commands and files inspected
- `sed -n '1,240p' package.json`
- `node <<'NODE' ... classify root scripts ... NODE`
- `bunx turbo query ls --output json`
- `bunx turbo query ls @beep/editor-app @beep/v2t @beep/desktop @beep/repo-cli @beep/infra --output json`

# Sources
- Repo: `package.json`
- Official Turborepo: `https://turborepo.dev/docs/crafting-your-repository/running-tasks`
