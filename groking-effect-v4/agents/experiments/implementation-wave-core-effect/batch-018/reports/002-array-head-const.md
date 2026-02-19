# 002-array-head-const

## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/head.const.ts` only.
- Replaced the generic zero-arg callable probe example with executable, behavior-focused examples for `Array.head`.
- Switched `effect/Array` import to `import * as A from "effect/Array"` and added `import * as O from "effect/Option"` per alias guidance.
- Added `formatOption` helper using `formatUnknown` to render `Option.some` / `Option.none()` outputs clearly.
- Added two semantically aligned examples:
  - Source-aligned `A.head([1, 2, 3])` and `A.head([])`.
  - `O.map` composition on `A.head(...)` for present vs empty arrays.
- Removed unused probe helper import and probe example block.

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/head.const.ts`
- Outcome: Passed (exit code 0). All three examples completed successfully.

## Notes / residual risks
- Output formatting assumes current `Option` runtime tags and `formatUnknown` behavior; functional semantics are deterministic and aligned with JSDoc.
