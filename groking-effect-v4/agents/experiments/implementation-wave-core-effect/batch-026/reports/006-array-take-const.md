## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/take.const.ts` to replace the probe-only example with executable `Array.take` examples.
- Switched `effect/Array` import to alias style (`import * as A from "effect/Array"`) and updated `moduleRecord` accordingly.
- Added two behavior-focused examples:
  - Source-aligned invocation (`A.take([1, 2, 3, 4, 5], 3)`).
  - Curried iterable + boundary cases (`A.take(2)(Set(...))`, `A.take([1, 2], 5)`, `A.take([1, 2], 0)`).
- Removed stale `probeNamedExportFunction` import and callable probe example.

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/take.const.ts`
- Outcome: Passed (exit code `0`). All three examples completed successfully.

## Notes / residual risks
- The generated header still references a source path (`.repos/effect-smol/...`) that is not present in this workspace, but runtime behavior and examples validate correctly against installed `effect/Array`.
