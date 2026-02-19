# 002-array-flatten-const

## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/flatten.const.ts` to replace the generic zero-arg callable probe with executable `flatten` behavior examples.
- Switched the module import alias to `import * as A from "effect/Array"` and aligned `moduleRecord` to that alias.
- Kept the runtime inspection example and added two semantic examples:
  - Source-aligned invocation from JSDoc input.
  - Single-level flatten contract demonstration, including input immutability check.
- Removed the now-unused `probeNamedExportFunction` import.

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/flatten.const.ts`
- Outcome: Passed (exit code `0`). All three examples completed successfully.

## Notes / residual risks
- The examples validate representative runtime behavior and immutability but do not exhaustively cover all type-level inference scenarios.
