## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/groupWith.const.ts` to replace generic callable probing with executable `groupWith` behavior examples.
- Switched `effect/Array` import to `import * as A from "effect/Array"` and removed now-unused probe helper import.
- Added two source-aligned behavior examples:
  - Documented two-argument invocation with adjacent-string grouping.
  - Curried invocation using parity equivalence to show reusable predicate form.
- Kept runtime inspection example and preserved the existing playground program shell.

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/groupWith.const.ts`
- Outcome: Passed (exit code 0). All three examples completed successfully.

## Notes / residual risks
- Examples rely on JSON rendering of grouped arrays and are deterministic.
- `groupWith` requires a non-empty input contract semantically; examples provide non-empty inputs only.
