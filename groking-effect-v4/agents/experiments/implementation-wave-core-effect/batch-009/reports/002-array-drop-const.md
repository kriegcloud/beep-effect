## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/drop.const.ts` to replace the zero-arg callable probe with executable, behavior-focused examples for `Array.drop`.
- Kept the runtime shell/top-level structure and runtime inspection example intact.
- Added source-aligned invocation coverage:
  - `Array.drop([1, 2, 3, 4, 5], 2)`
  - curried/data-last form `Array.drop(2)(new Set([10, 20, 30, 40]))`
  - boundary behavior `Array.drop([1, 2], 5)`
- Removed stale helper import usage (`probeNamedExportFunction`) and switched `effect/Array` import alias to `A` per prompt alias style.

## Verification command + outcome
- Command:
  - `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/drop.const.ts`
- Outcome:
  - Passed (exit code `0`)
  - All three examples completed successfully and logged expected `drop` behavior.

## Notes / residual risks
- The examples validate common and boundary runtime behavior, but they are illustrative (not assertions in a test harness).
- No files outside ownership/report scope were modified.
