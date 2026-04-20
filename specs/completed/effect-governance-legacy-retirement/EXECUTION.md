# Effect Governance Legacy Retirement - P3 Execution

## Status

**COMPLETED**

## Objective

Implement the chosen retirement path plus strictly necessary supporting glue.

## Implemented Path

P3 implemented option `A` from [PLANNING.md](./PLANNING.md): `full retirement` of the remaining Effect-lane ESLint surface, with no fallback triggered.

That resolved into three concrete moves:

- split the root ESLint story into a docs-only lane
- rewrite the live native-runtime governance command off `eslint/Linter`
- delete the leftover root `lint:effect-laws` lane plus the unused legacy rule corpus

## What Changed

### 1. Docs Lane Split

The mixed root ESLint surface was replaced with a docs-only config.

- added [../../../tooling/configs/src/eslint/DocsESLintConfig.ts](../../../tooling/configs/src/eslint/DocsESLintConfig.ts)
- repointed [../../../eslint.config.mjs](../../../eslint.config.mjs) to `DocsESLintConfig`
- updated [../../../tooling/configs/src/index.ts](../../../tooling/configs/src/index.ts) to export `DocsESLintConfig`
- updated [../../../tooling/configs/README.md](../../../tooling/configs/README.md) and [../../../tooling/configs/AGENTS.md](../../../tooling/configs/AGENTS.md) so the package no longer advertises the old mixed `ESLintConfig` as its headline surface
- added [../../../tooling/configs/test/docs-eslint-config.test.ts](../../../tooling/configs/test/docs-eslint-config.test.ts) to confirm the docs lane no longer registers the legacy `beep-laws` plugin

### 2. Engine-Neutral Native-Runtime Rewrite

The live repo-local native-runtime governance command now runs on a direct `ts-morph` AST walk instead of embedding `eslint/Linter`.

- rewrote [../../../tooling/cli/src/commands/Laws/NoNativeRuntime.ts](../../../tooling/cli/src/commands/Laws/NoNativeRuntime.ts)
- retained the current hotspot severity split through [../../../tooling/configs/src/eslint/NoNativeRuntimeHotspots.ts](../../../tooling/configs/src/eslint/NoNativeRuntimeHotspots.ts)
- retained allowlist suppression and allowlist-invalid blocking behavior through [../../../tooling/configs/src/eslint/EffectLawsAllowlist.ts](../../../tooling/configs/src/eslint/EffectLawsAllowlist.ts)
- kept the existing command surface `bun run beep laws native-runtime --check`

The rewrite preserves the main behaviors P2 required:

- same repo glob scope
- same hotspot-driven warn versus error split
- same exact-match allowlist suppression semantics
- allowlist-invalid diagnostics remain blocking

### 3. Legacy Lane Removal

Once the replacement path was green locally, the dead rollback lane and unused rule corpus were removed.

- removed root `lint:effect-laws`
- removed root `lint:effect-laws:strict`
- removed `//#lint:effect-laws` from [../../../turbo.json](../../../turbo.json)
- removed the legacy Effect-specific ESLint rule files:
  - `tooling/configs/src/eslint/EffectImportStyleRule.ts`
  - `tooling/configs/src/eslint/NoNativeRuntimeRule.ts`
  - `tooling/configs/src/eslint/SchemaFirstRule.ts`
  - `tooling/configs/src/eslint/TerseEffectStyleRule.ts`
  - `tooling/configs/src/eslint/ESLintConfig.ts`
- removed dead internal helpers that only existed for those rules:
  - `tooling/configs/src/internal/eslint/RulePathing.ts`
  - `tooling/configs/src/internal/eslint/RuleReporting.ts`
  - `tooling/configs/src/internal/eslint/RuleViolation.ts`
- removed the legacy fixture suite [../../../tooling/configs/test/eslint-rules.test.ts](../../../tooling/configs/test/eslint-rules.test.ts)
- reduced [../../../tooling/configs/test/effect-first-regressions.test.ts](../../../tooling/configs/test/effect-first-regressions.test.ts) to the retained docs and governance modules

### 4. Operator And Trust Surface Updates

The remaining user-facing docs and command text now point at the live governance lane instead of the retired rollback lane.

- updated [../../../tooling/cli/src/commands/Docs.ts](../../../tooling/cli/src/commands/Docs.ts) to point policy readers at `bun run lint:effect-governance`
- updated [../../../tooling/cli/src/commands/Laws/index.ts](../../../tooling/cli/src/commands/Laws/index.ts) log prefixes and descriptions from `effect-laws-*` wording to `effect-governance-*` wording
- removed two stale inline `beep-laws/*` suppression comments in the Wink NLP package so the docs-only ESLint lane no longer fails on unknown legacy rule ids

## Dependency Changes

The main dependency cut landed in [../../../tooling/cli/package.json](../../../tooling/cli/package.json):

- removed `eslint`
- removed `@typescript-eslint/parser`
- added explicit `ts-morph` because the native-runtime checker is now a direct AST scanner

`tooling/configs` intentionally retained ESLint dependencies because the docs lane still uses ESLint for JSDoc and TSDoc checks.

## Verification Evidence

### Passed

- `bunx --bun vitest run test/native-runtime.test.ts test/allowlist-check.test.ts` in `tooling/cli`
- `bunx --bun vitest run test/effect-first-regressions.test.ts test/docs-eslint-config.test.ts` in `tooling/configs`
- `bunx tsc -b tooling/cli/tsconfig.json tooling/configs/tsconfig.json --pretty false`
- `bun run lint:effect-governance`
- `bun run lint:jsdoc`
- `bunx eslint --config eslint.config.mjs tooling/cli/src/commands/Docs.ts tooling/cli/src/commands/Laws/index.ts tooling/configs/src/index.ts tooling/configs/src/eslint/DocsESLintConfig.ts tooling/configs/test/docs-eslint-config.test.ts tooling/configs/test/effect-first-regressions.test.ts`
- `git diff --check -- tooling/cli tooling/configs package.json turbo.json eslint.config.mjs specs/completed/effect-governance-legacy-retirement`

### Live Native-Runtime Command Result

`bun run beep laws native-runtime --check` completed successfully inside `lint:effect-governance` with:

- `scanned_files=774`
- `touched_files=25`
- `warnings=37`
- `errors=0`

That matches the intended post-cut posture: hotspot violations are still enforced, non-hotspot debt remains warning-only, and the blocking lane no longer routes through ESLint runtime machinery.

### Docs-Lane Caveat

`bun run lint:jsdoc` now exits successfully again after the stale inline `beep-laws/*` suppressions were removed, which confirms that the docs-only split did not break the root docs lane.

The lane still carries very large pre-existing warning-only TSDoc and JSDoc debt across the repo.

P4 should record that distinction clearly:

- docs-lane execution is intact
- repo-wide docs quality remains noisy and warning-heavy

## Residual Risks For P4

- shared hotspot and allowlist modules still live under `tooling/configs/src/eslint/*` paths even though they now function as governance data rather than live ESLint rule runtime
- P4 should verify that no hidden production consumer still expects the deleted `beep-laws` rule files or the removed root scripts
- P4 should record the repo-wide `lint:jsdoc` nonzero state carefully so it is treated as existing docs-lane debt, not as a regression introduced by the retirement cut
