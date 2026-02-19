## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/dropRight.const.ts` to replace the zero-arg callable probe with executable, source-aligned `dropRight` examples.
- Switched the `effect/Array` import alias to `A` and removed the now-unused probe helper import.
- Added concrete behavior examples for:
  - documented data-first invocation (`dropRight([1,2,3,4,5], 2)`)
  - dual/curried invocation (`dropRight(2)(...)`)
  - clamp behavior for oversized and negative `n`.

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/dropRight.const.ts`
- Outcome: Passed (exit code 0). All examples completed successfully.

## Notes / residual risks
- The runtime inspection output includes module export count/type preview, which may vary if upstream module exports change, but semantic invocation examples are deterministic.
