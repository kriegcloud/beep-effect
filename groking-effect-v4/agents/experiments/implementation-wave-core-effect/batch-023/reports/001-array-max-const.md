## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/max.const.ts` to replace generic runtime inspection/probe examples with executable `Array.max` behavior examples.
- Switched `effect/Array` to the required alias style: `import * as A from "effect/Array"`.
- Added source-aligned data-first and curried invocations of `A.max` with `Order.Number`.
- Added a mapped-order scenario using `Order.mapInput` to select the element with the largest derived latency value.
- Removed stale generic helper usage/imports that became unnecessary after replacing probe-only content.

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/max.const.ts`
- Outcome: Passed (exit code `0`). All three examples completed successfully.

## Notes / residual risks
- Examples validate runtime semantics for data-first, curried, and mapped-order usage; they do not assert compile-time non-empty-array guarantees.
