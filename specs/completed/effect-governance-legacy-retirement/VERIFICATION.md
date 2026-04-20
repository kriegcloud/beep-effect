# Effect Governance Legacy Retirement - P4 Verification

## Status

**COMPLETED**

## Final Recommendation

`full retirement`

## Objective

Verify retirement evidence, docs-lane safety, and dependency or performance or operational simplification for the chosen path.

## Summary

P4 verifies that this package reached `full retirement`.

The active root `lint:effect-laws` lane is gone, the live Effect-lane native-runtime governance command no longer embeds `eslint/Linter`, the docs lane now runs through a dedicated `DocsESLintConfig`, and the deleted legacy rule corpus has no hidden production consumers. The remaining `effect-laws` and `beep-laws` nouns are confined to active governance-data identity surfaces such as the allowlist document, generated allowlist snapshot, and the stable rule-id key used for allowlist matching. Under the locked package contract, that is acceptable naming debt and does not count as a retained ESLint shim.

## Evidence Buckets

### 1. Retirement Against The Locked Matrix

- Root rollback scripts are retired.
  - `package.json` no longer contains `lint:effect-laws` or `lint:effect-laws:strict`.
  - `rg -n --glob '!specs/**' --glob '!**/node_modules/**' 'lint:effect-laws|lint:effect-laws:strict|//#lint:effect-laws' package.json turbo.json .github tooling eslint.config.mjs .claude packages standards` returned no live matches.

- Legacy Turbo metadata is retired.
  - `turbo.json` no longer contains `//#lint:effect-laws`.
  - The root task graph keeps `//#lint:effect-governance` and `//#lint:jsdoc` only.

- The mixed root ESLint surface was split successfully.
  - [../../../eslint.config.mjs](../../../eslint.config.mjs) now exports `DocsESLintConfig`.
  - [../../../tooling/configs/test/docs-eslint-config.test.ts](../../../tooling/configs/test/docs-eslint-config.test.ts) passed and confirms the docs config does not register the legacy `beep-laws` plugin while retaining the docs plugins.

- The legacy rule corpus is actually gone.
  - Verified missing:
    - `tooling/configs/src/eslint/ESLintConfig.ts`
    - `tooling/configs/src/eslint/EffectImportStyleRule.ts`
    - `tooling/configs/src/eslint/NoNativeRuntimeRule.ts`
    - `tooling/configs/src/eslint/SchemaFirstRule.ts`
    - `tooling/configs/src/eslint/TerseEffectStyleRule.ts`
    - `tooling/configs/src/internal/eslint/RulePathing.ts`
    - `tooling/configs/src/internal/eslint/RuleReporting.ts`
    - `tooling/configs/src/internal/eslint/RuleViolation.ts`
    - `tooling/configs/test/eslint-rules.test.ts`

- The native-runtime blocker was removed rather than shimmed.
  - [../../../tooling/cli/src/commands/Laws/NoNativeRuntime.ts](../../../tooling/cli/src/commands/Laws/NoNativeRuntime.ts) now runs on `ts-morph`.
  - [../../../tooling/cli/package.json](../../../tooling/cli/package.json) no longer depends on `eslint` or `@typescript-eslint/parser`.
  - Search for `eslint/Linter`, `new Linter(`, `from "eslint"`, and `@typescript-eslint/parser` across `tooling/cli`, `tooling/configs`, `package.json`, and `eslint.config.mjs` showed only the expected docs-lane ESLint usage in `tooling/configs`, not a surviving production CLI engine dependency.

- Retained governance data remains live and intentional.
  - [../../../tooling/configs/src/eslint/EffectLawsAllowlist.ts](../../../tooling/configs/src/eslint/EffectLawsAllowlist.ts) and [../../../tooling/configs/src/eslint/NoNativeRuntimeHotspots.ts](../../../tooling/configs/src/eslint/NoNativeRuntimeHotspots.ts) still exist as shared governance data.
  - `bun run check:effect-laws-allowlist` passed inside `lint:effect-governance`.
  - This satisfies the P2 rule that active allowlist and hotspot behavior could remain even if the live Effect lane no longer executed ESLint rules.

- Hidden-consumer verification passed.
  - `rg -n --glob '!specs/**' --glob '!**/node_modules/**' 'lint:effect-laws|lint:effect-laws:strict|ESLintConfig\.ts|EffectImportStyleRule\.ts|NoNativeRuntimeRule\.ts|SchemaFirstRule\.ts|TerseEffectStyleRule\.ts' .github .claude apps packages tooling infra package.json turbo.json eslint.config.mjs` returned only the expected `DocsESLintConfig.ts` references in retained docs-lane files.
  - No live repo consumer still references the deleted rule files or the retired root rollback scripts.

### 2. Docs-Lane Safety

- `bun run lint:jsdoc` exited successfully.
  - Exit status: `0`
  - Final summary: `9196 problems (0 errors, 9196 warnings)`

- The docs lane remains warning-heavy but operationally intact.
  - The warning stream is dominated by pre-existing TSDoc and JSDoc debt, especially:
    - unsupported TSDoc config `$schema`
    - undefined `@category` and `@since` tags under the current TSDoc plugin setup
    - parameter-format warnings in older docs blocks
  - This is noisy but non-blocking and is not a regression introduced by the retirement cut.

- Focused docs-lane protection passed.
  - `tooling/configs` focused tests passed:
    - `test/effect-first-regressions.test.ts`
    - `test/docs-eslint-config.test.ts`
  - Those tests verify the retained docs config surface, the absence of the `beep-laws` plugin registration, and the continued integrity of the allowlist snapshot support modules.

### 3. Dependency And Operational Simplification

- The authoritative governance lane passed end to end.
  - `bun run lint:effect-governance` exited successfully.
  - The live native-runtime segment reported:
    - `scanned_files=774`
    - `touched_files=25`
    - `warnings=37`
    - `errors=0`

- The Effect lane no longer carries the old CLI engine dependency.
  - `tooling/cli` replaced `eslint` plus `@typescript-eslint/parser` with `ts-morph`.
  - This is the exact dependency cut that P2 identified as the main retirement blocker.

- The docs lane remains separate rather than being accidentally widened into the Effect lane.
  - Root `lint` still calls both `lint:effect-governance` and `lint:jsdoc`.
  - The CI lint job in [../../../.github/workflows/check.yml](../../../.github/workflows/check.yml) runs those lanes side by side without reviving a dedicated `lint:effect-laws` path.
  - `tooling/configs` intentionally still depends on ESLint and `@typescript-eslint/parser` because the docs lane still uses them. That does not violate the package objective.

## Fresh Verification Commands

- `cd tooling/cli && bunx --bun vitest run test/native-runtime.test.ts test/allowlist-check.test.ts`
  - passed with `2` files and `6` tests

- `cd tooling/configs && bunx --bun vitest run test/effect-first-regressions.test.ts test/docs-eslint-config.test.ts`
  - passed with `2` files and `8` tests

- `bunx tsc -b tooling/cli/tsconfig.json tooling/configs/tsconfig.json --pretty false`
  - passed

- `bun run lint:effect-governance`
  - passed

- `bun run lint:jsdoc`
  - passed with warning-only docs debt

- `git diff --check -- tooling/cli tooling/configs packages/common/nlp package.json turbo.json eslint.config.mjs specs/completed/effect-governance-legacy-retirement`
  - passed clean

## Final Verdict Rationale

Choose `full retirement`.

- Do not choose `minimal shim retained`.
  - There is no surviving ESLint-backed native-runtime bridge in the live Effect lane.
  - The last hard blocker identified in P1 and P2 was actually removed.

- Do not choose `no-go yet`.
  - The retirement matrix checks out against live repo reality.
  - The docs lane still executes successfully.
  - The dependency and operational simplification target is satisfied for the Effect lane.

The honest conclusion is that the repo has fully retired the remaining live legacy Effect-lane ESLint surface. What remains is governance data and naming debt, not a retained execution shim.

## Explicit Routing Back To Execution

No blocking route-back items are required.

### Optional Follow-Up After `Full Retirement`

- Decide separately whether the repo wants to rename `effect-laws` or `beep-laws` nouns inside the allowlist document, generated snapshot, and stable allowlist rule-id key.
- Decide separately whether the repo wants to pay down the large pre-existing `lint:jsdoc` warning debt and TSDoc config drift.

## Exit Gate

P4 is complete because:

- retirement evidence is recorded against the locked inventory and removal matrix
- docs-lane safety is recorded explicitly
- dependency and operational simplification is recorded explicitly
- the verdict is explicit
- there are no hidden execution fixes being smuggled through verification
