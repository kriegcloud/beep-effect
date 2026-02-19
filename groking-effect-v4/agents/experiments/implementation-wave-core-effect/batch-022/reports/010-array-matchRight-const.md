## Changes made
- Replaced generic callable probe example in `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/matchRight.const.ts` with source-aligned, executable `Array.matchRight` invocations.
- Switched `effect/Array` import to the required alias style (`import * as A from "effect/Array"`).
- Removed stale `probeNamedExportFunction` import and kept runtime inspection plus two deterministic behavior-focused examples:
  - Curried/source-aligned invocation with empty and non-empty arrays.
  - Data-first invocation showing `init`/`last` behavior for multi-element and singleton arrays.

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/matchRight.const.ts`
- Outcome: Success (exit code 0). All three examples completed and logged expected behavior.

## Notes / residual risks
- Residual risk is low; examples exercise both overload styles and key edge cases (`[]`, non-empty, singleton) for `matchRight`.
