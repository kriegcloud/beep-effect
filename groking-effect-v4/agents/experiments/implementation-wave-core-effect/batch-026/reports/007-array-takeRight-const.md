## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/takeRight.const.ts` to replace probe-only behavior with executable, semantically aligned examples for `Array.takeRight`.
- Switched `effect/Array` import alias to `A` and removed the unused `probeNamedExportFunction` helper import.
- Added two concrete behavior examples:
  - Source-aligned invocation matching the JSDoc call form.
  - Curried invocation plus boundary behavior (`n` larger than length and `n = 0`).

## Verification command + outcome
- Command:
  - `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/takeRight.const.ts`
- Outcome:
  - Passed (exit code `0`).
  - All three examples completed successfully and logged expected `takeRight` results.

## Notes / residual risks
- Validation covered runtime execution for documented and boundary examples.
- No additional type-check/lint pass was run in this batch task scope.
