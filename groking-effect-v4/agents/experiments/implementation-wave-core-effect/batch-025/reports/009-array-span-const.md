## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/span.const.ts` to replace the generic callable probe with executable `Array.span` examples aligned to source semantics.
- Switched the Array module import to alias style (`import * as A from "effect/Array"`) and removed the unused `probeNamedExportFunction` helper import.
- Kept runtime shape inspection and added two behavior-focused examples:
  - source-aligned direct invocation (`A.span([1, 3, 2, 4, 5], isOdd)`),
  - curried/data-last invocation with index-aware predicate and a no-prefix edge case.

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/span.const.ts`
- Outcome: Success (exit code `0`). All three examples completed and logged expected prefix/rest splits.

## Notes / residual risks
- Runtime inspection output (module export count and function preview) is informational and may vary if upstream module internals change.
- Verification was scoped to the required single-file execution command.
