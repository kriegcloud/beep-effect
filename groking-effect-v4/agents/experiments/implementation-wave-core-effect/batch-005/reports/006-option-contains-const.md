## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Option/exports/contains.const.ts`.
- Replaced generic runtime inspection and zero-arg probe examples with executable `Option.contains` examples aligned to documented behavior.
- Added a source-aligned numeric scenario (`some(2)`, `some(1)`, `none` with `contains(2)`) and a structural-equality nested-object scenario.
- Removed now-unused probe/inspection helpers and switched the Option import to alias style (`import * as O from "effect/Option"`).

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Option/exports/contains.const.ts`
- Outcome: Passed (exit code 0).
- Key output: Example 1 logged `true / false / false` for source-aligned checks; Example 2 logged `true / false` for structural object comparison.

## Notes / residual risks
- Examples are deterministic and semantically aligned with the summary/JSDoc contract.
- Residual risk is low; this playground focuses on representative behavior and does not exhaustively cover all equality edge cases.
