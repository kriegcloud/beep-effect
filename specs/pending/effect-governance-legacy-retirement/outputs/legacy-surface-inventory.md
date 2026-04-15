# Legacy Surface Inventory

## Status

Draft live inventory seeded during P0. Lock in P1.

| Bucket | Surface | Current Role | Evidence | Early Retirement Pressure |
|---|---|---|---|---|
| root-command | `package.json` -> `lint:effect-laws` | rollback or comparison script only | `package.json:83` | high |
| root-command | `package.json` -> `lint:effect-laws:strict` | stricter rollback or comparison wrapper | `package.json:87` | high |
| root-task-graph | `turbo.json` -> `//#lint:effect-laws` | cached metadata for legacy root task | `turbo.json:123` | high |
| root-config | `eslint.config.mjs` | root ESLint shim for current docs lane and legacy lane | `eslint.config.mjs:1-3` | split, not blind delete |
| repo-configs | `tooling/configs/src/eslint/ESLintConfig.ts` | combines `beep-laws` with docs-lane ESLint config | `ESLintConfig.ts:1-155` | high |
| repo-configs | `tooling/configs/src/eslint/EffectImportStyleRule.ts` | legacy Effect-law rule implementation | search results | high |
| repo-configs | `tooling/configs/src/eslint/NoNativeRuntimeRule.ts` | legacy Effect-law rule implementation still imported by CLI parity runner | `NoNativeRuntime.ts:9-16` | high, but validate consumer first |
| repo-configs | `tooling/configs/src/eslint/SchemaFirstRule.ts` | legacy Effect-law rule implementation | search results | high |
| repo-configs | `tooling/configs/src/eslint/TerseEffectStyleRule.ts` | legacy Effect-law rule implementation | search results | high |
| repo-configs | `tooling/configs/test/eslint-rules.test.ts` | legacy fixture corpus for Effect-law rules | search results | high after consumer removal |
| repo-configs | `tooling/configs/test/effect-first-regressions.test.ts` | guards internal legacy rule runtime conventions | search results | medium |
| repo-cli | `tooling/cli/src/commands/Laws/NoNativeRuntime.ts` | repo-local parity runner still using `eslint/Linter` | `NoNativeRuntime.ts:9-16,101-131` | high rewrite candidate |
| repo-cli | `tooling/cli/src/commands/Docs.ts` | still advertises `lint:effect-laws:strict` | `Docs.ts:107-129` | high |
| repo-configs-pkg | `tooling/configs/package.json` -> `eslint`, plugins, parser | package dependency surface for docs lane and legacy Effect-law rules | `tooling/configs/package.json` | split or retain-doc-lane |
| repo-cli-pkg | `tooling/cli/package.json` -> `eslint`, parser | package dependency surface for CLI native-runtime runner | `tooling/cli/package.json` | high rewrite candidate |
