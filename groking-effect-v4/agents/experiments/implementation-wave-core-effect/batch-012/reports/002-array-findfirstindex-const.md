## Changes made
- Replaced generic runtime inspection/probe examples with two executable, behavior-focused `findFirstIndex` examples.
- Added a source-aligned invocation example showing index and matched value for the first number greater than 5.
- Added a no-match example showing `undefined` when no array element satisfies the predicate.
- Updated the `effect/Array` import alias to `A` and removed now-unused probe/inspection helpers and module-record plumbing.

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/findFirstIndex.const.ts`
- Outcome: Failed (exit code 1)
- Error: `Cannot find module '@effect/platform-bun/BunContext' from '/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/runtime/Playground.ts'`

## Notes / residual risks
- The failure appears to be an environment/dependency resolution issue in shared runtime infrastructure, not in the edited export file logic.
- Because of the missing module, full runtime validation of the updated examples could not be completed in this environment.
