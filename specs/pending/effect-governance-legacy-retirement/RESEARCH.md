# Effect Governance Legacy Retirement - P0 Research

## Status

**IN PROGRESS**

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

Initial call:

- these are cleanup targets once the chosen retirement posture is clear
- trust surfaces that mention ESLint for the docs lane are not automatically wrong and should not be changed unless they imply the old Effect-law lane still matters

## Candidate Retirement Options

| Option | Description | Early Read |
|---|---|---|
| `A` | full Effect-lane retirement: remove root legacy scripts and task wiring, split docs-only ESLint config, delete Effect-law rule modules and tests, and rewrite the CLI native-runtime runner away from ESLint | strongest simplification if the runner rewrite is practical |
| `B` | minimal shim retained: remove root legacy scripts and most stale references, but keep a narrow internal ESLint-backed runner or shared rule module only where rewriting cost is too high | credible fallback if one parity surface is not yet cheap to rewrite |
| `C` | no-go yet: keep the current leftover surface because docs-lane separation or parity-runner rewrite is too risky right now | low preference unless validation finds a real blocker |

## Early Risks

- a naive delete of `tooling/configs/src/eslint/ESLintConfig.ts` would likely break `lint:jsdoc`
- `tooling/cli` may still need `@typescript-eslint/parser` even if `eslint` is removed, depending on the rewrite approach
- naming-only leftovers such as `effect-laws.allowlist` may or may not count as retirement blockers; P1 should decide that explicitly
- the allowlist integrity command survives the new governance lane and should not be deleted casually

## P0 Outputs To Expand

- [outputs/legacy-surface-inventory.md](./outputs/legacy-surface-inventory.md)
- [outputs/removal-matrix.md](./outputs/removal-matrix.md)
- [outputs/dependency-cut-map.md](./outputs/dependency-cut-map.md)
- [outputs/candidate-scorecard.md](./outputs/candidate-scorecard.md)

## Current Stop Point

P0 is open. The initial live inventory is seeded, but the package still needs:

- a complete one-by-one validation of the legacy surface inventory
- confirmation of every package and test dependency that still requires ESLint
- a sharper call on whether naming-only `effect-laws` leftovers belong in scope for retirement or only as optional cleanup
