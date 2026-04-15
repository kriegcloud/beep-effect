# Dependency Cut Map

## Status

Draft dependency view seeded during P0. Expand and lock in P1.

## Package-Level Reads

| Package | Dependency Edge | Current Consumer | Early Call |
|---|---|---|---|
| root `package.json` | `eslint` | `lint:jsdoc`, `lint:effect-laws` | root still needs ESLint while docs lane stays on it |
| root `package.json` | `eslint-plugin-jsdoc`, `eslint-plugin-tsdoc` | `lint:jsdoc` through `ESLintConfig` | docs-lane dependency, not automatically in retirement scope |
| `tooling/configs` | `eslint` | `ESLintConfig`, custom Effect-law rules, tests | likely split between docs-lane retention and Effect-law removal |
| `tooling/configs` | `@typescript-eslint/parser` | `ESLintConfig`, tests | likely retained with docs lane unless split elsewhere |
| `tooling/cli` | `eslint` | `commands/Laws/NoNativeRuntime.ts` | strongest rewrite target |
| `tooling/cli` | `@typescript-eslint/parser` | `commands/Laws/NoNativeRuntime.ts` | may disappear if the runner is rewritten away from ESLint |

## Command-Level Reads

| Command | Legacy Dependency | Notes |
|---|---|---|
| `lint:effect-laws` | root ESLint config plus `beep-laws` plugin | legacy root lane only |
| `lint:jsdoc` | root ESLint config plus docs-lane rules | intentionally separate lane |
| `bun run beep laws native-runtime --check` | `tooling/cli` runner plus `NoNativeRuntimeRule.ts` plus `eslint/Linter` | main remaining Effect-lane ESLint dependency |
| `bun run check:effect-laws-allowlist` | repo-local allowlist command | appears independent of ESLint rule execution |

## Current P0 Call

- `tooling/cli` is the clearest place where ESLint can leave the Effect lane entirely.
- `tooling/configs` may still need ESLint for the docs lane even after full Effect-lane retirement.
- P1 should decide whether naming-only leftovers such as `effect-laws.allowlist` belong to the required retirement set or only to optional cleanup.
