## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/isReadonlyArrayNonEmpty.const.ts` to replace the generic zero-arg callable probe with semantically aligned examples for `isReadonlyArrayNonEmpty`.
- Switched the `effect/Array` import alias to `A` and removed the now-unused `probeNamedExportFunction` import.
- Kept the runtime shell and top-level structure intact while adding executable behavior-focused examples:
  - Source-aligned checks for `[]` and `[1, 2, 3]`.
  - Guarded non-empty flow showing safe head access after predicate narrowing.

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/isReadonlyArrayNonEmpty.const.ts`
- Outcome: Passed (exit code 0). All three examples completed successfully and logged expected non-empty predicate behavior.

## Notes / residual risks
- Runtime preview shows function name `isArrayNonEmpty`; this appears to be internal function metadata while exported behavior remains correct.
- Residual risk is low: examples are deterministic and cover both empty and non-empty readonly-array cases.
