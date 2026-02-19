## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/reduce.const.ts` to replace probe-only behavior with executable `Array.reduce` examples.
- Switched the module import to the required alias style: `import * as A from "effect/Array"`.
- Removed the stale `probeNamedExportFunction` import and replaced the zero-arg callable probe with source-aligned behavior examples:
  - Data-first numeric reduction (`[1,2,3]` to `6`) plus empty-input seed behavior (`[]` to `10`).
  - Data-last/curried reduction that aggregates cart quantities by SKU.
- Kept runtime inspection as a quick shape/typeof anchor and retained the existing top-level program structure/runtime shell.

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/reduce.const.ts`
- Outcome: Passed (exit code `0`).
- Key outputs:
  - `A.reduce([1, 2, 3], 0, (acc, n) => acc + n) => 6`
  - `A.reduce([], 10, add) => 10`
  - `A.reduce(seed, combine)(cart) => {"tea":5,"coffee":1}`

## Notes / residual risks
- Examples are deterministic and do not rely on environment state.
- Residual risk is low; if upstream `effect/Array.reduce` overloads change, the data-last example is the most likely place to need adjustment.
