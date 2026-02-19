## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/flatMap.const.ts`.
- Replaced the generic zero-argument callable probe with executable `flatMap` examples aligned to the source contract.
- Switched the Array import alias to `A` and removed the now-unused `probeNamedExportFunction` helper import.
- Added two behavior examples:
  - Source-aligned invocation: `flatMap([1, 2, 3], (x) => [x, x * 2])`.
  - Curried/index-aware invocation: `flatMap((value, index) => [value, index])([10, 20, 30])`.

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/flatMap.const.ts`
- Outcome: Passed (exit code 0).
- Key outputs:
  - `flatMap([1,2,3], x => [x, x * 2]) => [1,2,2,4,3,6]`
  - `flatMap((value, index) => [value, index])([10,20,30]) => [10,0,20,1,30,2]`

## Notes / residual risks
- Examples are deterministic and demonstrate both uncurried and curried usage of the dual API.
- Residual risk is low; this playground does not include broader edge-case coverage beyond concise behavior demonstrations.
