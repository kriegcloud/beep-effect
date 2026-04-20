# Effect Governance Replacement - P3 Execution

## Status

**COMPLETED**

## Objective

Implement the chosen primary path plus strictly necessary supporting glue.

## Implemented Path

Implemented the locked repo-local hybrid staged cutover from P2:

- Biome is now the fast config and metadata steering layer for the Effect-specific lane.
- Repo-local exact parity surfaces remain in `@beep/repo-cli` for `effect-import-style`, `no-native-runtime`, and `terse-effect-style`.
- `schema-first` now runs through the inventory lane and its tracked baseline rather than through ESLint-shaped parity.
- The legacy Effect-law ESLint lane remains available for rollback through P4, but it is no longer on the blocking path for the primary Effect lane.

## Implementation Summary

### Blocking Lane Cutover

- Added root `lint:effect-governance` as the new blocking Effect-governance entrypoint.
- Updated the root `lint` script and CI lint job to run `lint:effect-governance` instead of `lint:effect-laws`.
- Kept `lint:effect-laws` and `lint:effect-laws:strict` available for rollback and comparison during P4.

### Repo-Local Exact Surfaces

- Fixed the stable-submodule handling bug in `tooling/cli/src/commands/Laws/EffectImports.ts`.
- Added a repo-local `no-native-runtime` parity runner in `tooling/cli/src/commands/Laws/NoNativeRuntime.ts`.
- Shared hotspot definitions between the legacy ESLint rule and the new CLI runner in `tooling/configs/src/eslint/NoNativeRuntimeHotspots.ts`.
- Expanded `tooling/cli/src/commands/Laws/TerseEffect.ts` so it now detects:
  - direct helper-reference cases
  - shared thunk-helper simplifications
  - `flow(...)` candidates for passthrough `pipe(...)` callbacks
- Kept auto-write behavior conservative for `terse-effect`: helper refs and thunk helpers can be rewritten automatically, while `flow(...)` candidates are detected but left for manual follow-up.

### Tests and Support Wiring

- Added targeted tests for the repaired and new repo-local surfaces:
  - `tooling/cli/test/effect-imports.test.ts`
  - `tooling/cli/test/native-runtime.test.ts`
  - `tooling/cli/test/terse-effect.test.ts`
- Added the new CLI dependencies needed by the repo-local parity runner in `tooling/cli/package.json`.
- Updated agent-facing startup and trust guidance so fresh sessions reach for `lint:effect-governance` rather than the old Effect-law lane.

### Schema-First Widening

- Refreshed `standards/schema-first.inventory.jsonc` using the inventory writer so the widened schema-first lane becomes the tracked truth surface.
- Intentionally preserved the live dirty user work in `packages/common/observability/src/CoreConfig.ts` and updated the inventory baseline instead of rewriting that file during P3.

## Changed Files and Purpose

### Primary Execution Surfaces

- `package.json`: added `lint:effect-governance`, rewired the root lint path, kept legacy rollback scripts.
- `turbo.json`: added the root `//#lint:effect-governance` task.
- `.github/workflows/check.yml`: switched the blocking CI lint lane from `lint:effect-laws` to `lint:effect-governance`.
- `tooling/cli/src/commands/Laws/index.ts`: registered the new `native-runtime` command and updated command output.
- `tooling/cli/src/commands/Laws/EffectImports.ts`: repaired stable-submodule detection.
- `tooling/cli/src/commands/Laws/NoNativeRuntime.ts`: added repo-local parity execution for `no-native-runtime`.
- `tooling/cli/src/commands/Laws/TerseEffect.ts`: expanded terse-effect detection and reporting.
- `tooling/configs/src/eslint/NoNativeRuntimeHotspots.ts`: centralized hotspot definitions.
- `tooling/configs/src/eslint/NoNativeRuntimeRule.ts`: consumes the shared hotspot definitions.
- `tooling/configs/src/eslint/ESLintConfig.ts`: consumes the shared hotspot error-file list.
- `standards/schema-first.inventory.jsonc`: refreshed inventory baseline for the widened schema-first lane.

### Required Support Adjustments

- `tooling/configs/src/internal/eslint/EffectLawsAllowlistSchemas.ts`: cleaned up the remaining terse-style blocker with a safe `flow(...)` rewrite.
- `packages/common/observability/src/CauseDiagnostics.ts`: updated import surfaces narrowly so the repaired import-style command passes without disturbing unrelated user changes.
- `tooling/cli/src/commands/Codex/internal/CodexSessionStartRuntime.ts`: points new sessions at `lint:effect-governance`.
- `.claude/hooks/agent-init/index.ts`
- `.claude/hooks/skill-suggester/index.ts`

## Migration Notes

- The blocking Effect-governance path has moved from `lint:effect-laws` to `lint:effect-governance`.
- The legacy Effect-law ESLint path is intentionally retained for rollback and parity review through P4.
- Full root-level ESLint removal is still deferred because the JSDoc or TSDoc lane remains separate.
- `schema-first` is intentionally no longer judged by ESLint-shaped parity expectations.

## Parity Status by Surface

### Preserved

- `effect-import-style` remains an exact repo-local check after fixing the stable-submodule bug.
- `no-native-runtime` keeps hotspot-vs-non-hotspot severity behavior and the existing allowlist format.
- `terse-effect-style` now covers the previously missing thunk-helper and `flow(...)` candidate categories.

### Intentionally Changed

- `schema-first` is now governed by the inventory lane and widened baseline rather than by the prior ESLint interpretation.
- The fast blocking entrypoint is now a hybrid path, not the old ESLint-only Effect lane.

### Deferred

- Full removal of the legacy ESLint Effect-law implementation from the repository is deferred until P4 validates the new path and the separate JSDoc or TSDoc lane is addressed.
- Full root-level `eslint` dependency removal remains out of scope for this phase.

## Command Evidence

### Targeted Tests

- `bunx --bun vitest run test/effect-imports.test.ts test/terse-effect.test.ts test/native-runtime.test.ts`
  - passed: 3 files, 11 tests
- `bunx --bun vitest run test/eslint-rules.test.ts test/effect-first-regressions.test.ts`
  - passed: 2 files, 34 tests

### Repo-Local Governance Commands

- `bun run lint:schema-first --write`
  - refreshed `standards/schema-first.inventory.jsonc`
- `bun run lint:schema-first`
  - passed with `missing_entries=0`, `stale_entries=0`, `enforced_candidates=0`
- `bun run check:effect-imports`
  - passed
- `bun run beep laws terse-effect --check`
  - passed
- `bun run beep laws native-runtime --check`
  - passed with 2 warnings and 0 errors
  - warning sites:
    - `packages/common/ui/src/components/orb.tsx:131:50`
    - `packages/common/ui/src/components/tour.tsx:162:9`
- `bun run lint:effect-governance`
  - passed end to end

### Compile Validation

- `bunx turbo run check --filter=@beep/repo-cli --filter=@beep/repo-configs --filter=@beep/observability`
  - passed

## Strategy-Level Surprises Encountered

- A temporary import cleanup moved `dual` to the root `effect` import surface, but targeted compile verification showed that `dual` is not exported from root `effect`.
- Restoring `dual` to `effect/Function` confirmed that the repaired import-style lane should normalize stable submodules without incorrectly collapsing valid Function helper imports.

## Known Gaps and Residual Risks for P4

- P4 still needs explicit parity write-up against the locked parity matrix rather than relying only on passing commands.
- Performance improvement has been inferred from lane replacement and narrower blocking execution, but it has not yet been benchmarked or measured in CI terms.
- Steering improvement on the locked evaluation corpus has not yet been scored in this phase.
- The new `no-native-runtime` path still reports two non-hotspot warnings in UI code; P4 should confirm these are acceptable carry-forward warnings rather than hidden regressions.

## Exit Gate

P3 is complete only when:

- the chosen path is implemented
- execution evidence is recorded
- unresolved gaps are explicit
- the phase artifact can be audited by P4 without hidden context

## Post-P4 Steering Follow-Up

After P4 locked a `staged cutover` verdict, a focused follow-up landed the cheap default steering layer that P4 said was still missing.

### Follow-Up Implementation Summary

- updated `.agents/skills/effect-first-development/SKILL.md` so it now explicitly prefers the flattest equivalent boolean and `Option` control flow before reaching for matcher trees
- expanded `tooling/cli/src/commands/Codex/internal/CodexSessionStartRuntime.ts` with explicit startup steering for:
  - `O.match(...)` versus flatter `Option` control flow
  - reusable `Match.value(...)` versus `Match.type<T>().pipe(...)` / `Match.tags(...)`
  - nested `Bool.match(...)` as a smell
- added an `effect-steering` prompt block in `.claude/hooks/skill-suggester/index.ts` for Effect-first prompts
- added post-edit Claude smell patterns for:
  - nested `Bool.match(...)`
  - reusable `Match.value(...)`
  - `O.match(...)` shapes that should be reviewed for flatter control flow
- added `check:effect-steering` at the root and folded it into `lint:effect-governance`

### Follow-Up Command Evidence

- `bun run check:effect-steering`
  - passed
- `bun run lint:effect-governance`
  - passed with the new steering gate included

### Follow-Up Routing Note

This follow-up materially improves the default steering story, but it does not silently upgrade the package verdict from `staged cutover` to `full replacement`. That promotion should happen only after a fresh explicit verification pass decides whether the new steering surfaces are strong enough on the locked corpus.
