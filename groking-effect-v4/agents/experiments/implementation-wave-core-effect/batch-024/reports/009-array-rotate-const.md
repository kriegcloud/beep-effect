## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/rotate.const.ts` to replace the generic callable probe with executable `Array.rotate` examples.
- Switched the `effect/Array` import to alias style (`import * as A from "effect/Array"`) and removed the unused `probeNamedExportFunction` helper import.
- Added concrete examples covering:
  - Source-aligned direct invocation (`A.rotate(array, n)`) with positive and negative rotation.
  - Curried invocation (`A.rotate(n)(array)`) and the `n = 0` copy behavior.

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/rotate.const.ts`
- Outcome: Success (exit code 0). All three examples executed and logged expected rotation behavior.

## Notes / residual risks
- The examples validate common runtime behavior paths, but this task did not add assertions-based automated tests for edge cases like fractional or very large rotation values.
