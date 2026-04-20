# Effect Governance Replacement - Parity Matrix

## Status

**VERIFIED**

## Current Effect-Specific Governance Surface

| Rule | Current Surface | Intent | Fixture Coverage | Validated Replacement Surface | Validated Parity Call | Coverage Moves To | Gap Status | P1 Status | Notes |
|---|---|---|---|---|---|---|---|---|---|
| `effect-import-style` | ESLint `beep-laws` plus `beep laws effect-imports` CLI | canonical aliases for selected `effect/*` helpers and root `effect` imports for other stable submodules | `tooling/configs/test/eslint-rules.test.ts:136-240` | repaired `effect-imports` exact surface and or equivalent repo-local replacement, optionally shadowed by Biome diagnostics | partial today, credible after repair | repaired repo-local exact surface | temporary gap and blocker for CLI-only path | `validated-repair-needed` | The current CLI has no dedicated tests and its stable-submodule predicate is wrong, so it cannot be treated as exact parity as-is. |
| `no-native-runtime` | ESLint `beep-laws` plus snapshot allowlist plus hotspot severity overrides | discourage native runtime, native errors, selected collection or date primitives, and stricter hotspot-only runtime APIs | `tooling/configs/test/eslint-rules.test.ts:243-358`, `standards/effect-laws.allowlist.jsonc`, `tooling/configs/src/eslint/ESLintConfig.ts:113-168` | new or retained repo-local parity runner with allowlist support, optionally shadowed by Biome diagnostics | partial parity only without a new hybrid surface | hybrid runner plus `allowlist-check` | blocker | `validated-hybrid-only` | This is the hardest rule family to replace. Hotspot scope, exception handling, and breadth all need an explicit plan. |
| `schema-first` | ESLint `beep-laws` plus repo-wide inventory command | push exported pure-data models toward schema-first modeling | `tooling/configs/test/eslint-rules.test.ts:150-167`, `tooling/cli/src/commands/Lint/SchemaFirst.ts` | promote `beep lint schema-first` inventory enforcement to the primary source of truth | stronger-than-current parity is validated | repo-wide inventory baseline | acceptable widening | `validated-survives` | `bun run lint:schema-first` currently reports one missing inventory entry in `packages/common/observability/src/CoreConfig.ts`, which is planning pressure rather than a reason to keep ESLint as the authority. |
| `terse-effect-style` | ESLint `beep-laws` plus `beep laws terse-effect` CLI | prefer direct helper refs, `flow(...)` for passthrough callbacks, and shared thunk helpers | `tooling/configs/test/eslint-rules.test.ts:381-458`, `tooling/configs/src/eslint/TerseEffectStyleRule.ts:148-260` | expand `beep laws terse-effect` and or add repo-local Biome coverage | current CLI is partial only, not exact | expanded repo-local CLI and or repo-local Biome rules | temporary gap and blocker for CLI-only path | `validated-partial` | The current CLI only rewrites direct helper-reference shapes. `flow(...)` and thunk-helper parity would be lost if ESLint vanished today. |

## Surface Notes

- Effect-specific parity is the primary matrix scope.
- JSDoc and TSDoc are intentionally excluded from this matrix and remain a separate lane.
- P1 validated each rule family against repo code, fixtures, runnable commands, and supporting repo surfaces.
- The matrix now records whether coverage loss is acceptable, temporary, or a blocker before P3.

## P4 Verification Notes

- `effect-import-style`
  - verified as preserved through the repaired repo-local command, focused CLI tests, and the surviving legacy fixture corpus
- `no-native-runtime`
  - verified as preserved for the Effect lane, including hotspot severity behavior and allowlist semantics
  - the only remaining live findings are the two explicit non-hotspot UI warnings carried forward from P3
- `schema-first`
  - verified as an intentional stronger remap to the inventory lane rather than an accidental parity loss
- `terse-effect-style`
  - verified as preserved for the locked binary corpus after the repo-local CLI expansion
- matrix-level verdict
  - parity evidence supports the current `lint:effect-governance` lane as the authoritative Effect-governance path
  - after the fresh post-follow-up steering re-review, the package-level verdict can now be promoted to `full replacement` because the locked steering-review cases are covered by shipped default-path guidance and checks rather than future work
