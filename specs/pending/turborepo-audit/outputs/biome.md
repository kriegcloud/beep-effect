# Topic
Biome

## TLDR
Biome is already a good fit for this repo's Turbo model. Package-local `biome check` scripts are cacheable, ownership is clear, and the current setup mostly needs preservation rather than redesign.

## Score
0.90

## Current repo evidence
- `biome.jsonc` enables the Turborepo domain rules and keeps repo-wide formatting/lint behavior centralized.
- Root `package.json` delegates `lint` through Turbo, then layers on repo-governance commands.
- `packages/common/ui/package.json` uses `biome check src/ .storybook/` and `biome check src/ .storybook/ --write`.
- `apps/editor-app/package.json` and `apps/V2T/package.json` use `biome check src/ scripts/`.
- `apps/desktop/package.json` uses `biome check src/`.
- `tooling/cli/package.json` uses `biome check .`.
- `turbo.json` defines a cached `lint` task that depends on upstream `lint` tasks.

## Official Turborepo guidance
- The Turborepo Biome guide recommends modeling linting as package scripts and letting Turbo cache and parallelize them.
- That matches this repo's current structure: each package owns its own Biome command surface, and Turbo orchestrates execution across the workspace.

## Gaps or strengths
- Strength: the Biome setup is already package-owned and Turbo-friendly.
- Strength: the repo does not force Biome into a root-only orchestration bottleneck.
- Gap: the root `lint` command includes many non-Biome checks, so Biome is part of a larger quality pipeline rather than the only lint lane.

## Improvement or preservation plan
- Preserve the current model.
- Keep new Biome checks package-local so Turbo can continue caching and parallelizing them.
- Avoid moving shared source-tree checks into the root `lint` wrapper unless they are genuinely repo-global.

## Commands and files inspected
- `sed -n '1,220p' biome.jsonc`
- `node -e '...package.json scripts...'`
- `rg -n '"check"|"build"|"test"|"lint"' apps/V2T/package.json apps/editor-app/package.json packages/common/ui/package.json tooling/cli/package.json apps/desktop/package.json infra/package.json package.json`
- `bunx turbo query ls @beep/ui --output json`
- `bunx turbo query ls @beep/editor-app --output json`
- `bunx turbo query ls @beep/v2t --output json`

## Sources
- Repo: `biome.jsonc`
- Repo: `package.json`
- Repo: `apps/editor-app/package.json`
- Repo: `apps/V2T/package.json`
- Repo: `packages/common/ui/package.json`
- Repo: `apps/desktop/package.json`
- Repo: `tooling/cli/package.json`
- Turbo docs: `https://turborepo.dev/docs/guides/tools/biome`
