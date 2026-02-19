## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/map.const.ts` to remove the generic zero-arg callable probe example.
- Switched `effect/Array` import to alias style (`import * as A from "effect/Array"`) and updated `moduleRecord` accordingly.
- Added executable, behavior-focused examples aligned with `Array.map` semantics:
  - Data-first mapping example (`A.map([1, 2, 3], x => x * 2)`) including immutability confirmation.
  - Data-last/curried mapping example with index-aware callback output.
- Kept the existing top-level runtime/program shell and runtime inspection example.

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/map.const.ts`
- Outcome: Passed (exit code `0`). All three examples completed successfully.

## Notes / residual risks
- The runtime inspection example still depends on shared playground helpers; if helper formatting changes, preview text may vary, but semantic map examples remain stable.
