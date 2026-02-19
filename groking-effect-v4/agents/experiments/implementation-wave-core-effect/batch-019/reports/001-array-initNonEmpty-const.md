## Changes made
- Updated imports in `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/initNonEmpty.const.ts` by removing stale probe/inspection helpers and switching the array module alias to `import * as A from "effect/Array"`.
- Replaced generic reflection/probe examples with executable, behavior-focused examples:
  - Source-aligned invocation of `A.initNonEmpty([1, 2, 3, 4])`.
  - Boundary example for singleton input plus a contract note showing `A.init([])` as the safe alternative for possibly-empty arrays.
- Removed now-unused `moduleRecord` binding.

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/initNonEmpty.const.ts`
- Outcome: Success (exit code `0`).
- Observed key outputs:
  - `Array.initNonEmpty([1,2,3,4]) -> [1,2,3]`
  - `Array.initNonEmpty([42]) -> []`
  - `Array.init([]) -> undefined`

## Notes / residual risks
- `initNonEmpty` is enforced as non-empty at the type level; if type checks are bypassed, runtime permissiveness can still allow invalid usage patterns.
