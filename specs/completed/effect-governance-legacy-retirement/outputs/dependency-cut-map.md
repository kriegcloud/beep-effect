# Dependency Cut Map

## Status

Validated dependency view captured during P0. Lock in P1.

## Package-Level Reads

| Package | Dependency Edge | Current Consumer | Early Call |
|---|---|---|---|
| root `package.json` | `eslint` | `lint:jsdoc`, `lint:effect-laws` | root still needs ESLint while docs lane stays on it |
| root `package.json` | `eslint-plugin-jsdoc`, `eslint-plugin-tsdoc` | `lint:jsdoc` through `ESLintConfig` | explicit docs-lane dependency, not automatically in retirement scope |
| `tooling/configs` | `eslint` | mixed `ESLintConfig`, legacy rule modules, tests | docs lane and Effect rules are currently co-located |
| `tooling/configs` | `@typescript-eslint/parser` | mixed `ESLintConfig`, tests | likely retained with docs lane unless the docs config moves again |
| `tooling/configs` | `eslint-plugin-jsdoc`, `eslint-plugin-tsdoc` | docs-only segment of `ESLintConfig` | docs-lane retention, not Effect-lane blocker |
| `tooling/cli` | `eslint` | `commands/Laws/NoNativeRuntime.ts` | strongest rewrite target and only live CLI engine dependency |
| `tooling/cli` | `@typescript-eslint/parser` | `commands/Laws/NoNativeRuntime.ts` | may disappear if the runner is rewritten away from ESLint |

## Consumer Map

| Surface | Live Consumers | Retirement Meaning |
|---|---|---|
| package-root `ESLintConfig` export | `eslint.config.mjs`, `tooling/configs/test/eslint-rules.test.ts`, `tooling/configs/README.md`, `tooling/configs/AGENTS.md` | split docs lane from legacy Effect rules before deleting the mixed export |
| `NoNativeRuntimeRule.ts` | `tooling/cli/src/commands/Laws/NoNativeRuntime.ts`, `tooling/configs/test/eslint-rules.test.ts` | rewriting the CLI runner removes the last non-test production consumer |
| `NoNativeRuntimeHotspots.ts` | `ESLintConfig.ts`, `NoNativeRuntime.ts` | hotspot severity contract must survive any rewrite or shim |
| allowlist schema and snapshot modules | `NoNativeRuntimeRule.ts`, `AllowlistCheck.ts`, `effect-first-regressions.test.ts` | active governance data path, not itself an ESLint-engine blocker |

## Command-Level Reads

| Command | Legacy Dependency | Notes |
|---|---|---|
| `lint:effect-governance` | `beep laws native-runtime --check` plus `check:effect-laws-allowlist` | authoritative lane already bypasses repo-wide ESLint for Effect governance except where the parity runner still embeds it |
| `lint:effect-laws` | root ESLint config plus `beep-laws` plugin | legacy root lane only |
| `lint:jsdoc` | root ESLint config plus docs-lane rules | intentionally separate lane |
| `bun run beep laws native-runtime --check` | `tooling/cli` runner plus `NoNativeRuntimeRule.ts` plus `eslint/Linter` | main remaining Effect-lane ESLint dependency |
| `bun run check:effect-laws-allowlist` | repo-local allowlist command | active governance check and already independent of ESLint rule execution |

## Current P0 Call

- `tooling/cli` is the clearest place where ESLint can leave the Effect lane entirely.
- `tooling/configs` may still need ESLint for the docs lane even after full Effect-lane retirement.
- deleting legacy rule modules before rewriting `NoNativeRuntime.ts` would break an active governance command, not just dead scaffolding.
- naming surfaces such as `effect-laws.allowlist` are active governance data today; P1 should decide whether renaming them is required for `full retirement` or optional follow-up cleanup.
