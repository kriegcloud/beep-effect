## Changes made
- Replaced generic runtime inspection and zero-arg callable probe examples with executable, semantics-aligned `Option.exists` examples.
- Updated `effect/Option` import to alias style (`import * as O from "effect/Option"`) and removed stale helper imports/values (`inspectNamedExport`, `probeNamedExportFunction`, `moduleRecord`).
- Added two behavior-focused examples:
  - Source-aligned even-number predicate checks across `some(2)`, `some(1)`, and `none`.
  - Refinement predicate checks for loaded vs loading user states (plus `none`).

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Option/exports/exists.const.ts`
- Outcome: Passed (exit code 0). Both examples completed and logged expected boolean results.

## Notes / residual risks
- The examples validate curried usage (`option.pipe(O.exists(predicate))`) and refinement behavior at runtime.
- No additional automated checks were requested beyond the required `bun run` execution.
