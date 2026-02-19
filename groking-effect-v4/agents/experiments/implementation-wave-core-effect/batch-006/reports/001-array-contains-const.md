## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/contains.const.ts` to replace generic runtime inspection/probe examples with executable, behavior-focused `Array.contains` examples.
- Removed stale helper imports (`inspectNamedExport`, `probeNamedExportFunction`) and switched `effect/Array` import to the required alias style (`import * as A from "effect/Array"`).
- Added source-aligned curried usage (`pipe(..., A.contains(...))`), data-first usage (`A.contains(iterable, value)`), and an `Equal.equivalence()` behavior example contrasting `Array.contains` with native `includes`.

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/contains.const.ts`
- Outcome: Passed (exit code 0). All examples completed successfully.

## Notes / residual risks
- The structural-equality example depends on Effect's `Equal.equivalence()` semantics for plain objects, which is correct for the current Effect version but could change if upstream equality semantics are revised.
