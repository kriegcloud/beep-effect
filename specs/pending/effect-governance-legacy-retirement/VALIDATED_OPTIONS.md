# Effect Governance Legacy Retirement - P1 Validated Options

## Status

**COMPLETED**

## Objective

Validate the P0 inventory, lock the removal matrix, and narrow the retirement space to a credible shortlist.

## Expected Inputs

- [RESEARCH.md](./RESEARCH.md)
- [outputs/legacy-surface-inventory.md](./outputs/legacy-surface-inventory.md)
- [outputs/removal-matrix.md](./outputs/removal-matrix.md)
- [outputs/dependency-cut-map.md](./outputs/dependency-cut-map.md)
- live repo surfaces needed to validate P0 claims

## Validated Surface-By-Surface Calls

| Surface Family | Validated Call | Must Survive Into P2? | Evidence | Planning Note |
|---|---|---|---|---|
| root `lint:effect-laws` scripts and Turbo task | removable | no | `package.json`, `turbo.json`, replacement-package verification, current CI | these are rollback-only leftovers now |
| mixed `ESLintConfig` export path | split rather than deleted | yes, as docs-only ESLint surface | `eslint.config.mjs`, `tooling/configs/src/eslint/ESLintConfig.ts`, `tooling/configs/src/index.ts`, `lint:jsdoc` | docs lane still needs a root ESLint entrypoint |
| legacy Effect-law rule corpus except `NoNativeRuntimeRule.ts` | removable after config split | no | rule-module imports, `tooling/configs/test/eslint-rules.test.ts`, current command graph | no active production command still requires these once the mixed lane is gone |
| `NoNativeRuntime.ts` plus `NoNativeRuntimeRule.ts` | active blocker; rewrite or retain minimal shim | yes | `tooling/cli/src/commands/Laws/NoNativeRuntime.ts`, `tooling/cli/test/native-runtime.test.ts` | this is the only current production Effect-lane `eslint` runtime |
| allowlist integrity surface | retain function; rename optional | yes | `package.json`, `AllowlistCheck.ts`, allowlist standards files, snapshot codegen test | active governance data, not dead rollback scaffolding |
| docs and trust surfaces that mention `lint:effect-laws` or `ESLintConfig` as the package headline story | update | yes | `tooling/cli/src/commands/Docs.ts`, `tooling/cli/src/commands/Laws/index.ts`, `tooling/configs/README.md`, `tooling/configs/AGENTS.md` | operator-facing drift should be corrected alongside the chosen retirement path |
| downstream `eslint-disable beep-laws/*` comments | optional follow-up cleanup | no | `packages/common/nlp/src/Wink/WinkSimilarity.ts`, `packages/common/nlp/src/Wink/WinkEngine.ts` | do not let this tail wag the main retirement decision |

## Locked Inventory Boundary

### Required Retirement Set

- root `lint:effect-laws` scripts and Turbo metadata
- the mixed `ESLintConfig` publication path that keeps docs lane and legacy Effect rules bundled together
- the legacy rule modules and tests that only survive because of that bundled path or the native-runtime runner
- stale docs or trust surfaces that still present `lint:effect-laws` as a relevant validation command
- `tooling/cli` package dependencies on `eslint` and `@typescript-eslint/parser` if the native-runtime runner is successfully rewritten

### Active-But-Retained Set

- `check:effect-laws-allowlist`
- `tooling/cli/src/commands/Laws/AllowlistCheck.ts`
- `standards/effect-laws.allowlist.jsonc`
- `standards/effect-laws.allowlist.schema.json`
- allowlist schema and snapshot helpers under `tooling/configs/src/internal/eslint`
- hotspot path definitions that the native-runtime replacement or shim still needs
- repo-wide ESLint itself, but only for the JSDoc or TSDoc lane while that lane remains on ESLint

### Optional Cleanup Set

- downstream `eslint-disable beep-laws/*` comments
- legacy naming on active allowlist surfaces, unless P2 decides naming convergence is required for the package verdict

## Credible Shortlist

### 1. Full Effect-Lane Retirement

Validated shape:

- remove root legacy `lint:effect-laws` command surfaces
- split the mixed `ESLintConfig` path into a docs-only ESLint export
- remove the legacy Effect-law rule modules once their last active production consumer is gone
- rewrite `NoNativeRuntime.ts` away from `eslint/Linter`
- keep the allowlist integrity surface as active governance data, with rename or relocation treated as a separate planning choice

Why it survives:

- current research found only two real technical choke points:
  - the mixed `ESLintConfig` export path
  - the native-runtime parity runner
- it maximizes Effect-lane dependency simplification without forcing repo-wide ESLint removal
- it aligns with the user's primary objective of removing `beep-laws` and ESLint as an Effect-lane choke point

### 2. Minimal Shim Retained

Validated shape:

- remove root legacy `lint:effect-laws` command surfaces
- split the docs lane off from the mixed `ESLintConfig` export
- remove the legacy rule corpus except the smallest native-runtime bridge still needed
- keep one narrow `eslint`-backed native-runtime shim temporarily if the rewrite cost or parity risk is higher than expected

Why it survives:

- it preserves nearly all operator simplification except the last blocker
- it is the only honest fallback if P2 concludes the native-runtime rewrite is not cheap enough for the chosen implementation wave

Why it does not outrank option 1:

- the current research did not find a second hidden production `eslint` runtime
- retaining a shim after splitting the docs lane would leave a known choke point in place without a newly-discovered reason

## Rejected Options

| Option | Verdict | Reason |
|---|---|---|
| Keep the current leftover legacy surface largely as-is | rejected | P1 did not validate a blocker large enough to justify the status quo. The remaining technical choke points are specific and actionable. |
| Repo-wide ESLint removal in the same project wave | rejected for this package | The package scope is Effect-lane retirement, not an unrelated redesign of the JSDoc or TSDoc lane. |
| Delete the allowlist surface together with the legacy rule modules | rejected | The allowlist integrity surface is still active governance data inside `lint:effect-governance` and is already independent of the ESLint engine runtime. |
| Treat downstream `eslint-disable beep-laws/*` comments as a primary blocker | rejected | Those comments are cleanup work that follows the main retirement decision; they do not justify retaining the old engine path. |

## Important Validated Notes

- `NoNativeRuntime.ts` remains the only honest candidate for a temporary shim.
- `full retirement` does not require repo-wide ESLint deletion while `lint:jsdoc` remains on ESLint.
- the allowlist naming question is now a planning-scope choice, not a discovery gap.
- focused live tests passed for:
  - `tooling/cli` native-runtime and allowlist-check surfaces
  - `tooling/configs` legacy rule and allowlist snapshot surfaces

## Remaining Questions For P2

- should `full retirement` require renaming active `effect-laws` nouns, or is removing the legacy execution path sufficient for the verdict
- if a minimal shim is retained, what is the narrowest honest cut line for that shim
- should the allowlist runtime stay under `tooling/configs/src/internal/eslint`, or move when the native-runtime path is rewritten
- can `tooling/configs` drop any Effect-rule-only `eslint` dependencies after the docs split, or is that package still the right home for the surviving docs config

## Exit Gate

- inventory locked: yes
- remove-or-retain matrix locked: yes
- weak options rejected: yes
- shortlist explicit: yes
- P2 can plan without reopening broad discovery: yes
