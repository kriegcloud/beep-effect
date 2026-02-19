## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/isReadonlyArrayEmpty.const.ts` to replace generic callable probing with source-aligned executable examples.
- Switched the `effect/Array` import to alias style `import * as A from "effect/Array"` and updated `moduleRecord` accordingly.
- Removed the unused `probeNamedExportFunction` import and added two concrete behavior examples:
  - Source-aligned invocation for `[]` and `[1, 2, 3]`.
  - A readonly batch guard flow that skips empty arrays and processes non-empty batches.

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/isReadonlyArrayEmpty.const.ts`
- Outcome: Success (exit code 0). All three examples completed and logged expected boolean/guard behavior.

## Notes / residual risks
- Runtime preview currently shows `[Function isArrayEmpty]`; this appears to be a shared implementation naming detail in the upstream module and does not affect `isReadonlyArrayEmpty` behavior.
