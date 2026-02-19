## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/range.const.ts`.
- Replaced the generic zero-argument callable probe with executable `Array.range` examples aligned to the source contract.
- Switched the `effect/Array` import to `import * as A from "effect/Array"` and removed the unused probe helper import.
- Added two behavior-focused invocations:
  - Source-aligned inclusive ranges (`A.range(1, 3)` and `A.range(-2, 2)`).
  - Edge contract for `start > end` (`A.range(5, 2)` returns `[5]`) plus the equal-bounds case (`A.range(4, 4)`).
- Kept the runtime inspection example and existing program shell intact.

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/range.const.ts`
- Outcome: Passed (exit code 0).
- Key outputs:
  - `A.range(1, 3) => [1,2,3]`
  - `A.range(-2, 2) => [-2,-1,0,1,2]`
  - `A.range(5, 2) => [5]`

## Notes / residual risks
- Examples are deterministic and aligned with the implementation contract in `Array.ts`.
- Residual risk is low; this playground demonstrates common and edge behavior but does not exhaustively test very large numeric ranges.
