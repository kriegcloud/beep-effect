## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/sort.const.ts` to replace probe-only examples with executable `Array.sort` scenarios.
- Switched `effect/Array` import alias to `A` and added `effect/Order` for source-aligned invocation.
- Removed unused probe helper import and added `formatUnknown` for concise value-focused logging.
- Added concrete examples for:
  - documented direct invocation (`A.sort(input, Order.Number)`),
  - curried invocation (`A.sort(Order.Number)(values)`),
  - non-mutating behavior (mutating sorted copy does not change original input).

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/sort.const.ts`
- Outcome: success (exit code `0`). All four examples completed and logged expected sorting behavior.

## Notes / residual risks
- Runtime inspection remains intentionally included to satisfy value-like export guidance and to show the export shape before behavior examples.
- No additional test suite was run beyond the required file execution command.
