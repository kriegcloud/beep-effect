## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/allocate.const.ts` to replace generic runtime inspection/probe examples with executable, behavior-focused `Array.allocate` examples.
- Kept the existing top-level playground structure and runtime shell (`createPlaygroundProgram` + `BunRuntime.runMain`).
- Switched `effect/Array` import to alias style (`import * as A from "effect/Array"`) and removed unused probe helpers/imports.
- Added three deterministic examples:
  - Source-aligned allocation (`A.allocate<number>(3)`) showing fixed length and sparse slots.
  - Imperative fill workflow after allocation.
  - Invalid-length contract behavior (negative and non-integer lengths throwing `RangeError`).

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/allocate.const.ts`
- Outcome: Passed (exit code `0`). All three examples completed successfully and the program finished with `✅ Demo complete for effect/Array.allocate`.

## Notes / residual risks
- Runtime behavior for invalid lengths is inherited from native `new Array(n)` semantics (`RangeError` for invalid length values). If upstream `effect/Array.allocate` semantics ever diverge from native behavior, this example would need to be revised.
