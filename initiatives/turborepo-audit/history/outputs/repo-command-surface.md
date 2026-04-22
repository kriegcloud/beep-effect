## Topic

Repo command surface

## TLDR

The root command surface is workable but overloaded. The healthy part is the thin Turbo delegation layer for common entrypoints like `dev`, `build`, `check`, `test`, `storybook`, and `docgen`. The costly part is the mixed second layer where root commands still own repo-governance checks, custom orchestration, and CI-only wrappers. That split is reasonable in places, but it makes the root `package.json` feel more like an operations control plane than a clean Turbo front door.

## Score

0.76 (`mixed`)

## Current repo evidence

- Root `package.json` delegates the main monorepo flows through Turbo: `dev`, `build`, `build:ci`, `check`, `check:infra`, `test`, `lint`, `lint:fix`, `storybook`, `build-storybook`, `test:storybook`, `docgen`, and `docgen:affected`.
- Those same scripts layer extra non-Turbo work on top of Turbo in several places:
  - `test`: `bunx turbo run test --concurrency=1 && bun run test:types`
  - `lint`: `bunx turbo run lint lint:effect-laws lint:jsdoc lint:spell lint:markdown lint:circular lint:versions && ...`
  - `docgen`: `bunx turbo run docgen && bun run beep docs aggregate --clean`
  - `docgen:affected`: `bunx turbo run docgen --filter=...[origin/main] && bun run beep docs aggregate --clean`
- Root `package.json` also exposes a wide repo-CLI surface that lives outside Turbo task execution, including `topo-sort`, `codegen`, `create-package`, `config-sync`, `version-sync`, `purge`, `lint:schema-first`, `lint:tooling-tagged-errors`, `check:effect-laws-allowlist`, and `graphiti:proxy`.
- Several direct-tool root commands bypass the task graph entirely: `check:full`, `lint:jsdoc`, `lint:effect-laws`, `lint:typos`, `lint:spell`, `lint:markdown`, `lint:repo`, and `lint:ox`.
- Package coverage is strong underneath the root surface. `bunx turbo query ls --output json` reports broad package coverage, and core packages/apps already expose package-local `build`, `check`, `test`, `lint`, and `docgen` scripts. Examples include `apps/editor-app/package.json`, `apps/desktop/package.json`, `packages/common/ui/package.json`, `tooling/cli/package.json`, and `infra/package.json`.
- Root config still has several root-only pseudo tasks in `turbo.json` using `//#...` keys for `check:infra`, `lint:jsdoc`, `lint:effect-laws`, `lint:typos`, `lint:spell`, `lint:markdown`, `lint:circular`, `lint:repo`, `lint:ox`, and `lint:versions`.

## Official Turborepo guidance

- Turborepo recommends describing workflows as package tasks and running them through `turbo run`, with the root command surface acting as the repository entrypoint rather than the place where task logic accumulates: https://turborepo.dev/docs/crafting-your-repository/running-tasks
- The package/task graph model is strongest when work is expressed as package scripts that Turbo can schedule, cache, and filter instead of as ad hoc root orchestration: https://turborepo.dev/docs/core-concepts/package-and-task-graph
- Package configurations are the current first-party way to keep shared defaults in the root while moving package-specific task behavior closer to the owner: https://turborepo.dev/docs/reference/package-configurations

## Gaps or strengths

- Strength: the repo already uses Turbo as the primary front door for the core developer workflows. This is not a monorepo that forgot to adopt package tasks.
- Strength: package-local script ownership is broad and consistent, which means the repo can modernize the root surface without first inventing a package-task culture.
- Gap: the root command surface is still doing too much policy and orchestration work itself. `lint`, `test`, and `docgen` are especially layered, which makes it harder to reason about what is in the Turbo graph versus what is always root-only work.
- Gap: several repo-wide checks that may deserve Turbo visibility, especially `lint:ox`, are still plain root commands outside the graph.
- Gap: the `//#...` root-only task block in `turbo.json` shows that some work has been made cache-aware without truly becoming package-owned, which keeps visibility centralized but limits graph fidelity.
- Justified tradeoff: some repo-governance commands should stay outside the package graph if they are truly global checks, especially policy lanes like schema-first validation, tagged-error linting, or allowlist verification.

## Improvement or preservation plan

1. Preserve the current thin root DX for `dev`, `build`, `check`, `test`, `lint`, and Storybook/docgen entrypoints.
2. Split the root surface into three explicit classes in follow-up work: Turbo entrypoints, global repo-governance commands, and operational utilities.
3. Pull the clearest package- or graph-friendly direct commands into Turbo first, starting with `lint:ox`, then any other repeatable repo-wide checks that can be made deterministic and cache-aware without losing correctness.
4. Keep truly global repo-policy commands outside Turbo when package scoping would be artificial, but document that choice in the root script inventory so the boundary is intentional instead of historical.
5. Revisit the root-only `//#...` task block and move any package-specific behavior into package-level `turbo.json` files where ownership is already obvious.

## Commands and files inspected

- `node -e 'const p=require("./package.json"); console.log(JSON.stringify({scripts:p.scripts}, null, 2))'`
- `node <<'NODE' ... classify root scripts ... NODE`
- `bunx turbo query ls --output json`
- `bunx turbo query ls @beep/editor-app @beep/desktop @beep/ui @beep/repo-cli --output json`
- `sed -n '1,260p' turbo.json`
- `apps/editor-app/package.json`
- `apps/desktop/package.json`
- `packages/common/ui/package.json`
- `tooling/cli/package.json`
- `infra/package.json`
- `package.json`

## Sources

- Repo:
  - `package.json`
  - `turbo.json`
  - `apps/editor-app/package.json`
  - `apps/desktop/package.json`
  - `packages/common/ui/package.json`
  - `tooling/cli/package.json`
  - `infra/package.json`
  - `bunx turbo query ls --output json`
  - `bunx turbo query ls @beep/editor-app @beep/desktop @beep/ui @beep/repo-cli --output json`
- Official Turborepo:
  - https://turborepo.dev/docs/crafting-your-repository/running-tasks
  - https://turborepo.dev/docs/core-concepts/package-and-task-graph
  - https://turborepo.dev/docs/reference/package-configurations
