# Legacy Surface Inventory

## Status

Locked in P1 after P0 validation.

| Bucket | Surface | Current Role | Evidence | Early Retirement Pressure |
|---|---|---|---|---|
| root-command | `package.json` -> `lint:effect-laws` | rollback or comparison script only | `package.json:83` | high |
| root-command | `package.json` -> `lint:effect-laws:strict` | stricter rollback or comparison wrapper | `package.json:87` | high |
| root-command | `package.json` -> `check:effect-laws-allowlist` | active integrity gate still called by `lint:effect-governance` | `package.json:77-79` | retain function, naming debt only |
| root-task-graph | `turbo.json` -> `//#lint:effect-laws` | cached metadata for legacy root task | `turbo.json:123` | high |
| root-config | `eslint.config.mjs` | root ESLint shim for current docs lane and legacy lane | `eslint.config.mjs:1-3` | split, not blind delete |
| repo-configs | `tooling/configs/src/eslint/ESLintConfig.ts` | combines `beep-laws` with docs-lane ESLint config | `ESLintConfig.ts:1-155` | high |
| repo-configs | `tooling/configs/src/index.ts` | package-root re-export of mixed `ESLintConfig` | `tooling/configs/src/index.ts:7-35` | medium split surface |
| repo-configs | `tooling/configs/src/eslint/EffectImportStyleRule.ts` | legacy Effect-law rule implementation | search results | high |
| repo-configs | `tooling/configs/src/eslint/NoNativeRuntimeRule.ts` | legacy Effect-law rule implementation still imported by CLI parity runner | `NoNativeRuntime.ts:9-16` | high, but validate consumer first |
| repo-configs | `tooling/configs/src/eslint/SchemaFirstRule.ts` | legacy Effect-law rule implementation | search results | high |
| repo-configs | `tooling/configs/src/eslint/TerseEffectStyleRule.ts` | legacy Effect-law rule implementation | search results | high |
| repo-configs | `tooling/configs/src/internal/eslint/EffectLawsAllowlistSchemas.ts` | active allowlist parse and decode runtime shared by current governance surfaces | search results | retain function unless moved or renamed |
| repo-configs | `tooling/configs/src/internal/eslint/generated/EffectLawsAllowlistSnapshot.ts` | generated allowlist snapshot used by current native-runtime rule flow | search results | retain function unless rule removed |
| repo-configs | `tooling/configs/src/internal/eslint/RuleReporting.ts` | allowlist suppression adapter used by legacy rule modules | search results | high after rule removal |
| repo-configs | `tooling/configs/test/eslint-rules.test.ts` | legacy fixture corpus for Effect-law rules | search results | high after consumer removal |
| repo-configs | `tooling/configs/test/effect-first-regressions.test.ts` | guards rule-runtime conventions plus allowlist snapshot codegen | search results | medium, split rather than blind delete |
| repo-configs-docs | `tooling/configs/README.md` | still presents `ESLintConfig` as the primary package story | search results | high |
| repo-configs-docs | `tooling/configs/AGENTS.md` | still frames the package surface around `ESLintConfig` | search results | high |
| repo-cli | `tooling/cli/src/commands/Laws/NoNativeRuntime.ts` | repo-local parity runner still using `eslint/Linter` | `NoNativeRuntime.ts:9-16,101-131` | high rewrite candidate |
| repo-cli | `tooling/cli/src/commands/Laws/AllowlistCheck.ts` | active allowlist integrity gate that is already independent of `eslint` engine runtime | `AllowlistCheck.ts:1-180` | retain function, optional rename |
| repo-cli | `tooling/cli/src/commands/Laws/index.ts` | user-facing command descriptions still use `effect-laws` naming | `Laws/index.ts:180-245` | medium rename or update |
| repo-cli | `tooling/cli/src/commands/Docs.ts` | still advertises `lint:effect-laws:strict` | `Docs.ts:107-129` | high |
| repo-cli-test | `tooling/cli/test/native-runtime.test.ts` | active proof harness for the ESLint-backed native-runtime runner | search results | retain until rewrite lands |
| repo-cli-test | `tooling/cli/test/allowlist-check.test.ts` | active proof harness for allowlist integrity gate | search results | retain |
| repo-configs-pkg | `tooling/configs/package.json` -> `eslint`, plugins, parser | package dependency surface for docs lane and legacy Effect-law rules | `tooling/configs/package.json` | split or retain-doc-lane |
| repo-cli-pkg | `tooling/cli/package.json` -> `eslint`, parser | package dependency surface for CLI native-runtime runner | `tooling/cli/package.json` | high rewrite candidate |
| standards | `standards/effect-laws.allowlist.jsonc` | active governance data for allowlisted native-runtime exceptions | search results | retain function, naming debt only |
| standards | `standards/effect-laws.allowlist.schema.json` | schema contract for the active allowlist document | search results | low, rename debt only |
| downstream-annotations | `packages/common/nlp/src/Wink/WinkSimilarity.ts` and `WinkEngine.ts` inline `beep-laws` disables | downstream rule-id references that become stale if the legacy rules disappear | search results | low, follow-up cleanup |
