## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/prepend.const.ts` to replace the generic callable probe with executable, semantically aligned `Array.prepend` examples.
- Switched the `effect/Array` import to the required alias style: `import * as A from "effect/Array"`.
- Removed the now-unused `probeNamedExportFunction` import.
- Kept runtime inspection and added behavior-focused invocations:
  - Source-aligned documented call: `prepend([2, 3, 4], 1)`.
  - Curried/data-last usage with iterable input and empty-array case: `prepend("intro")(Set(...))` and `prepend(9)([])`.

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/prepend.const.ts`
- Outcome: Passed (exit code `0`). All examples completed successfully.

## Notes / residual risks
- The playground demonstrates runtime behavior and call forms, but it does not assert compile-time `NonEmptyArray` typing guarantees.
