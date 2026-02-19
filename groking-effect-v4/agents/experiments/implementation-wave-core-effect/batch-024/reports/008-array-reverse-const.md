## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/reverse.const.ts` to replace probe-only behavior with executable, semantics-focused examples for `Array.reverse`.
- Switched `effect/Array` import alias to `A` to match batch alias style.
- Removed the zero-argument callable probe and added source-aligned/direct invocation examples:
  - direct array reversal (`[1,2,3,4] -> [4,3,2,1]`),
  - iterable (`Set`) reversal into a new array,
  - non-mutating behavior showing the original array remains unchanged.
- Kept the existing top-level program shell (`createPlaygroundProgram` + `BunRuntime.runMain`) and concise behavior-focused logging.

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/reverse.const.ts`
- Outcome: Success (exit code `0`). All four examples completed, and the program finished with `✅ Demo complete for effect/Array.reverse`.

## Notes / residual risks
- Examples are deterministic and align with the documented contract for `reverse` (accept iterable, return new reversed array, no input mutation).
- No additional residual risks identified for this file-level change.
