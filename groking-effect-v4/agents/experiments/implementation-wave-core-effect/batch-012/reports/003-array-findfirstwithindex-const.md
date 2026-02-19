## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/findFirstWithIndex.const.ts` only.
- Replaced generic zero-argument callable probe with executable, source-aligned examples for `findFirstWithIndex`.
- Switched `effect/Array` import alias to `A` per alias guidance.
- Removed unused `probeNamedExportFunction` helper import.
- Added behavior-focused examples:
  - Data-first call matching the source JSDoc style.
  - Curried predicate-first call demonstrating both `undefined` and tuple `[element, index]` outcomes.

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/findFirstWithIndex.const.ts`
- Outcome: Failed in this environment with:
  - `error: Cannot find module '@effect/platform-bun/BunContext' from '/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/runtime/Playground.ts'`

## Notes / residual risks
- The export file changes are implemented, but end-to-end runtime verification is currently blocked by missing runtime dependency resolution in the local environment.
