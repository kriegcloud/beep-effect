# Effect Governance Legacy Retirement - P0 Research

## Status

**COMPLETED**

## Objective

Inventory the remaining legacy Effect-law surface and map credible retirement paths now that `lint:effect-governance` is the authoritative Effect-governance lane.

## Live Baseline

The completed replacement package already established these facts:

- `lint:effect-governance` is the authoritative Effect-governance lane
- `lint:effect-laws` is no longer on the blocking root lint path or CI lint job
- the legacy Effect-law lane remains only as rollback or comparison scaffolding

This package starts from that baseline rather than reopening the replacement verdict.

## Initial Research Findings

### 1. Root command and config surfaces still expose the legacy lane

- `package.json` still defines:
  - `lint:effect-laws`
  - `lint:effect-laws:strict`
- `turbo.json` still defines the root cached task `//#lint:effect-laws`
- `eslint.config.mjs` still re-exports the full `ESLintConfig` surface from `@beep/repo-configs`

Initial call:

- these are explicit retirement candidates because they are no longer required for the blocking Effect-governance path
- `eslint.config.mjs` is not automatically removable because `lint:jsdoc` still depends on ESLint

### 2. `@beep/repo-configs` still mixes Effect-law and docs-lane ESLint concerns

`tooling/configs/src/eslint/ESLintConfig.ts` still bundles:

- the `beep-laws` plugin with:
  - `effect-import-style`
  - `no-native-runtime`
  - `schema-first`
  - `terse-effect-style`
- the `beep-jsdoc` category rule
- `eslint-plugin-jsdoc`
- `eslint-plugin-tsdoc`

Initial call:

- this file is the main split point
- a credible retirement path likely needs a docs-only ESLint config or export boundary rather than deleting the whole package blindly

### 3. The legacy Effect-law rule modules and tests still exist

Live files include:

- `tooling/configs/src/eslint/EffectImportStyleRule.ts`
- `tooling/configs/src/eslint/NoNativeRuntimeRule.ts`
- `tooling/configs/src/eslint/SchemaFirstRule.ts`
- `tooling/configs/src/eslint/TerseEffectStyleRule.ts`
- `tooling/configs/test/eslint-rules.test.ts`
- `tooling/configs/test/effect-first-regressions.test.ts`

Initial call:

- these are likely removable if no runtime consumer still depends on them
- the main uncertainty is `NoNativeRuntimeRule.ts`, because the repo-local CLI parity runner still imports it directly

### 4. `@beep/repo-cli` still keeps ESLint inside one Effect-lane parity runner

`tooling/cli/src/commands/Laws/NoNativeRuntime.ts` still imports:

- `@typescript-eslint/parser`
- `eslint`
- `@beep/repo-configs/eslint/NoNativeRuntimeRule`

Initial call:

- this is the clearest remaining Effect-lane ESLint dependency
- retiring the legacy Effect-law surface probably requires rewriting this runner away from `eslint/Linter`, or explicitly retaining it as the smallest honest shim

### 5. Some docs and trust surfaces still mention the legacy lane

Current examples:

- `tooling/cli/src/commands/Docs.ts` still advertises `bun run lint:effect-laws:strict`
- `tooling/configs/README.md` still presents `ESLintConfig` as the root usage story
- `tooling/configs/AGENTS.md` still frames the package around `ESLintConfig`
- `tooling/cli/src/commands/Laws/index.ts` still describes the command group as `Effect law` validation

Initial call:

- these are cleanup targets once the chosen retirement posture is clear
- trust surfaces that mention ESLint for the docs lane are not automatically wrong and should not be changed unless they imply the old Effect-law lane still matters

### 6. The allowlist surface is still active governance, but it is not the ESLint-engine blocker

Live usage shows:

- `lint:effect-governance` still calls `check:effect-laws-allowlist`
- `tooling/cli/src/commands/Laws/AllowlistCheck.ts` is already an Effect-first integrity gate and does not instantiate `eslint`
- `standards/effect-laws.allowlist.jsonc` plus `standards/effect-laws.allowlist.schema.json` remain active inputs
- `tooling/configs/src/internal/eslint/EffectLawsAllowlistSchemas.ts` and the generated snapshot still back the allowlist runtime used by the native-runtime rule family

Initial call:

- the `effect-laws` name is legacy, but this surface is not dead rollback scaffolding
- this is better classified as active governance data plus naming debt, not as the primary blocker to removing `eslint` from the Effect lane

### 7. The active consumer graph is narrower than "all of repo-configs"

Validated consumer map:

- `eslint.config.mjs` consumes the package-root `ESLintConfig` export for the root ESLint entrypoint
- `tooling/configs/src/index.ts` re-exports the same mixed `ESLintConfig`
- `tooling/configs/test/eslint-rules.test.ts` exercises the legacy rule modules and the mixed root config
- `tooling/cli/src/commands/Laws/NoNativeRuntime.ts` is the only live CLI runtime that still pulls in:
  - `eslint`
  - `@typescript-eslint/parser`
  - `@beep/repo-configs/eslint/NoNativeRuntimeRule`
- `tooling/cli/test/native-runtime.test.ts` proves the current parity runner contract

Initial call:

- `NoNativeRuntime.ts` is the hard blocker to removing `eslint` from the Effect lane inside `tooling/cli`
- `ESLintConfig.ts` is the hard blocker to keeping the docs lane on ESLint without also carrying the legacy Effect-law plugin surface
- the rest of the rule corpus looks downstream of those two choke points rather than independently necessary

### 8. Downstream source annotations exist, but they look like follow-up cleanup rather than retention blockers

Live examples:

- `packages/common/nlp/src/Wink/WinkSimilarity.ts` uses `eslint-disable-next-line beep-laws/no-native-runtime`
- `packages/common/nlp/src/Wink/WinkEngine.ts` uses `eslint-disable-next-line beep-laws/schema-first`

Initial call:

- if the legacy rule ids disappear, these comments become stale and should be cleaned or remapped
- they are not a reason to retain the old rule implementations by themselves

## Candidate Retirement Options

| Option | Description | Early Read |
|---|---|---|
| `A` | full Effect-lane retirement: remove root legacy scripts and task wiring, split docs-only ESLint config, delete Effect-law rule modules and tests, and rewrite the CLI native-runtime runner away from ESLint | strongest simplification if the runner rewrite is practical |
| `B` | minimal shim retained: remove root legacy scripts and most stale references, but keep a narrow internal ESLint-backed runner or shared rule module only where rewriting cost is too high | credible fallback if one parity surface is not yet cheap to rewrite |
| `C` | no-go yet: keep the current leftover surface because docs-lane separation or parity-runner rewrite is too risky right now | low preference unless validation finds a real blocker |

## Early Risks

- a naive delete of `tooling/configs/src/eslint/ESLintConfig.ts` would likely break `lint:jsdoc`
- `tooling/cli` may still need `@typescript-eslint/parser` even if `eslint` is removed, depending on the rewrite approach
- the package must distinguish active governance data from dead rollback scaffolding; `effect-laws.allowlist` is currently active, even if the name is legacy
- the allowlist integrity command survives the new governance lane and should not be deleted casually
- downstream `eslint-disable` annotations will need cleanup if the legacy rule ids disappear

## P0 Outputs To Expand

- [outputs/legacy-surface-inventory.md](./outputs/legacy-surface-inventory.md)
- [outputs/removal-matrix.md](./outputs/removal-matrix.md)
- [outputs/dependency-cut-map.md](./outputs/dependency-cut-map.md)
- [outputs/candidate-scorecard.md](./outputs/candidate-scorecard.md)

## Validation Snapshot

Focused live checks passed while validating the current surface:

- `tooling/cli`: `bunx --bun vitest run test/native-runtime.test.ts test/allowlist-check.test.ts`
  - `2` files passed, `6` tests passed
- `tooling/configs`: `bunx --bun vitest run test/eslint-rules.test.ts test/effect-first-regressions.test.ts`
  - `2` files passed, `34` tests passed

These results do not prove the retirement plan, but they do confirm that the currently-inventoried native-runtime, allowlist, and legacy-rule surfaces are real and still wired as described above.

## Current Stop Point

P0 now has a validated dependency picture:

- the actual ESLint-removal blocker set is much smaller than the whole legacy surface
- `NoNativeRuntime.ts` plus the mixed `ESLintConfig` export are the two main technical choke points
- the allowlist surface is active governance data and naming debt, not dead rollback-only infrastructure

The remaining open call is mostly a scope decision for P1:

- does `full retirement` require renaming active `effect-laws` nouns, or is removing the Effect-lane ESLint execution path sufficient
- if a minimal shim is retained, is the native-runtime runner the only honest candidate

If the trackers stay aligned with these findings, P0 is ready to close and P1 can narrow the options instead of reopening discovery.
