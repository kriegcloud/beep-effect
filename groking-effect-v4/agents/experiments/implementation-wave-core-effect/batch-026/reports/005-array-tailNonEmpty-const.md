## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/tailNonEmpty.const.ts` to replace generic zero-arg probing with semantically aligned, executable examples for `Array.tailNonEmpty`.
- Switched the `effect/Array` import to alias style `import * as A from "effect/Array"` and removed the unused `probeNamedExportFunction` import.
- Kept the program shell and top-level structure intact while adding behavior-focused examples:
  - Runtime shape inspection with `tailNonEmpty.length`.
  - Source-aligned invocation (`[1,2,3,4] -> [2,3,4]`).
  - Boundary behavior on singleton input with a safe alternative (`Array.tail`) for possibly-empty arrays.

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/tailNonEmpty.const.ts`
- Outcome: Success (exit code 0). All three examples completed and logged expected behavior.

## Notes / residual risks
- Runtime behavior aligns with summary and JSDoc intent.
- No additional risks identified for this file within the scoped ownership.
