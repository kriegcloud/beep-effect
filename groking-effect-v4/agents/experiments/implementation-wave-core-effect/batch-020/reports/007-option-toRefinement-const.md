## Changes made
- Replaced generic runtime inspection and zero-arg probe examples with two executable, behavior-focused `Option.toRefinement` examples.
- Switched the Option import to the required alias style (`import * as O from "effect/Option"`).
- Removed stale helper usage/imports (`inspectNamedExport`, `probeNamedExportFunction`, and `moduleRecord`) and added `formatUnknown` for concise output formatting.
- Added:
  - A source-aligned refinement example using `string | number` input and `O.toRefinement(parseString)`.
  - A filtering workflow example that applies a derived refinement to keep only non-empty strings from mixed inputs.

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Option/exports/toRefinement.const.ts`
- Outcome: Success (exit code 0). Both examples completed and logged expected behavior (`true/false` refinement checks and filtered string-only output).

## Notes / residual risks
- The examples confirm runtime semantics and practical usage patterns. Compile-time narrowing is demonstrated by usage in a refinement branch and `Array.filter`, but no separate type-test file was added (out of ownership scope).
