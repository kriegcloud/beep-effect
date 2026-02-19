## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/liftResult.const.ts` to replace the generic callable probe with executable, semantics-focused examples.
- Kept the existing runtime inspection example and added two behavior examples:
  - Source-aligned `parseNumber` lift showing success (`[42]`) and failure (`[]`).
  - Multi-argument `divide` lift showing preserved arity and failure collapse to `[]`.
- Removed stale `probeNamedExportFunction` usage/import.
- Switched `effect/Array` import to alias style (`import * as A from "effect/Array"`) and added `effect/Result` import for concrete `Result` values.

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/liftResult.const.ts`
- Outcome: Passed (exit code 0). All examples completed, including:
  - `liftedParseNumber("42") => [42]`
  - `liftedParseNumber("not a number") => []`
  - `liftedDivide(10, 2) => [5]`
  - `liftedDivide(10, 0) => []`

## Notes / residual risks
- Examples are deterministic and avoid environment-dependent behavior.
- No additional residual risks identified for this export-level playground implementation.
