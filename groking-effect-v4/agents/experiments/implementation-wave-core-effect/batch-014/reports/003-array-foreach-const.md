## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/forEach.const.ts` to replace generic runtime inspection/probe examples with executable, semantics-focused `Array.forEach` examples.
- Switched the `effect/Array` import to alias style (`import * as A from "effect/Array"`).
- Removed now-unused probe/inspection helpers and `moduleRecord`.
- Added two behavior examples:
  - Data-first invocation (`A.forEach(array, callback)`) showing `(value, index)` visitation.
  - Data-last invocation (`A.forEach(callback)(array)`) showing curried usage.
- Kept the existing top-level program shell (`createPlaygroundProgram` + `BunRuntime.runMain(program)`).

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/forEach.const.ts`
- Outcome: Passed (exit code 0). Both examples completed successfully and logged expected side-effect behavior.

## Notes / residual risks
- Examples validate observed runtime behavior (callback receives element/index and return value is `undefined`) for the current `effect/Array` implementation.
- No additional edge-case probes (for example sparse arrays) were added to keep logs concise and focused.
