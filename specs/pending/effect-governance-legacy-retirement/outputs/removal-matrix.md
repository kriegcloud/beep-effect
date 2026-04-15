# Removal Matrix

## Status

Locked in P1 after P0 validation.

| Surface | Current Function | Proposed Disposition | Why | Status |
|---|---|---|---|---|
| `lint:effect-laws` | legacy rollback script | remove | no longer authoritative or on blocking path | validated-remove |
| `lint:effect-laws:strict` | stricter rollback script | remove | stale user-facing entrypoint after replacement promotion | validated-remove |
| `//#lint:effect-laws` | Turbo task metadata | remove | only supports the legacy root script | validated-remove |
| `eslint.config.mjs` | root ESLint shim | retain with docs-only target after split | `lint:jsdoc` still needs a root ESLint entrypoint even if Effect rules leave | validated-split |
| `ESLintConfig.ts` mixed export | combines Effect-law and docs-lane config | split | docs lane should survive without carrying `beep-laws` | validated-split |
| package-root `ESLintConfig` export and docs story | publishes the mixed config as the package headline surface | update after split | trust surfaces should stop implying the legacy Effect-law bundle is the package purpose | validated-update |
| `EffectImportStyleRule.ts`, `SchemaFirstRule.ts`, `TerseEffectStyleRule.ts` | legacy Effect-law rule implementations | remove after split | no current production command requires them once the mixed ESLint lane is retired | validated-remove-after-split |
| `NoNativeRuntimeRule.ts` | rule implementation still used by active CLI parity runner | rewrite away from ESLint or retain as minimal shim temporarily | last non-test production consumer still depends on it | validated-hard-blocker |
| allowlist runtime and generated snapshot | active governance data path used by native-runtime and allowlist-check surfaces | retain function, optional rename or move later | active governance data is not dead rollback scaffolding | validated-retain-function |
| `eslint-rules.test.ts` | fixture suite for legacy rules | remove or reduce after rule removal | only needed while the legacy rule modules remain | validated-remove-after-rule-removal |
| `effect-first-regressions.test.ts` | conventions around rule runtime modules plus allowlist snapshot codegen | split or reduce | some assertions remain useful for shared allowlist code even after rule removal | validated-split |
| `NoNativeRuntime.ts` ESLint-backed runner | repo-local parity runner | rewrite away from ESLint or keep the smallest honest shim | clearest remaining Effect-lane ESLint dependency | validated-hard-blocker |
| `tooling/cli` ESLint deps | supports `NoNativeRuntime.ts` | remove if rewrite succeeds | should disappear from the Effect lane if the runner is rewritten | validated-remove-after-rewrite |
| `tooling/configs` ESLint deps | supports docs lane and mixed config | partially retain for docs lane, remove Effect-rule-only pieces if split allows | not automatically removable while docs lane stays on ESLint | validated-partial-retain |
| `check:effect-laws-allowlist` and `AllowlistCheck.ts` | active integrity gate in authoritative lane | retain function; optional rename later | still called by `lint:effect-governance` and already engine-independent | validated-retain-function |
| stale docs and command references to `lint:effect-laws` | outdated guidance | update | reduces drift and operator confusion | validated-update |
| downstream `eslint-disable beep-laws/*` comments | rule-id annotations in source | optional cleanup after implementation | stale once legacy rule ids disappear, but not a reason to retain them | optional-follow-up |
