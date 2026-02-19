## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/of.const.ts` to replace generic callable probing with executable, source-aligned `Array.of` examples.
- Switched the `effect/Array` import to the required alias style: `import * as A from "effect/Array"`.
- Removed the unused `probeNamedExportFunction` import.
- Kept runtime inspection and added behavior-focused examples:
  - Documented unary invocation: `Array.of(1)`.
  - Reference-preservation behavior when wrapping an object.

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/of.const.ts`
- Outcome: Passed (exit code `0`). All three examples completed successfully.

## Notes / residual risks
- The examples validate runtime behavior and source-aligned usage for `Array.of`; they do not assert compile-time type guarantees of `NonEmptyArray`.
