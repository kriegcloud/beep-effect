# Topic
ESLint

## TLDR
ESLint is used here as a specialized repo-governance layer rather than the default lint engine. That is sensible, but the root command surface is heavier than it needs to be.

## Score
0.78

## Current repo evidence
- `eslint.config.mjs` is a tiny shim that re-exports `@beep/repo-configs`.
- Root `package.json` defines `lint:jsdoc`, `lint:effect-laws`, `lint:effect-laws:strict`, and the effect-law allowlist check.
- Root `package.json` also chains `lint:jsdoc` and `lint:effect-laws` through `turbo run lint ...`.
- `turbo.json` defines cached root tasks for `//#lint:jsdoc` and `//#lint:effect-laws`.
- The root `lint` script mixes Turbo package tasks with direct root-level governance commands.
- `lint:effect-laws` ignores `**/docs/**`, which shows the ESLint lanes are intentionally policy-oriented rather than broad package linting.

## Official Turborepo guidance
- The Turborepo ESLint guide recommends package scripts and Turbo caching when ESLint is a per-package task.
- This repo uses ESLint differently: it is a centralized policy layer for Effect-specific and doc-specific rules, not the broad package lint engine.
- That is an acceptable tradeoff when the check is repo-global and not naturally owned by a single package.

## Gaps or strengths
- Strength: ESLint configuration is shared through `@beep/repo-configs`, so the policy surface is centralized.
- Strength: the ESLint lanes are explicitly named and can be targeted independently.
- Gap: root `lint` is a long orchestration command, so ESLint participates in a bigger maintenance surface than the Turborepo docs would suggest for a simple lint lane.
- Gap: the ESLint lanes are root tasks, so they do not benefit from package-level task ownership.

## Improvement or preservation plan
- Preserve the current centralized policy role for ESLint.
- Do not try to force all linting into ESLint; Biome already owns most package-level source linting.
- If more ESLint checks are added, prefer package-owned scripts and Turbo tasks only when the rule set is package-scoped.
- Where possible, move ignore logic into shared config instead of growing one-off root flags.

## Commands and files inspected
- `sed -n '1,260p' eslint.config.mjs`
- `node -e '...package.json scripts...'`
- `rg -n '"lint:jsdoc"|"lint:effect-laws"|"lint:effect-laws:strict"|"check:effect-laws-allowlist"' package.json .github/workflows/check.yml tooling -S`
- `sed -n '1,260p' turbo.json`
- `sed -n '1,260p' .github/workflows/check.yml`

## Sources
- Repo: `eslint.config.mjs`
- Repo: `package.json`
- Repo: `turbo.json`
- Repo: `.github/workflows/check.yml`
- Turbo docs: `https://turborepo.dev/docs/guides/tools/eslint`
