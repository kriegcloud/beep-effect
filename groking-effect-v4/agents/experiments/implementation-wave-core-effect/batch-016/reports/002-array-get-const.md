## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/get.const.ts` to replace the generic zero-arg probe example with executable, semantics-focused `Array.get` examples.
- Switched module import to alias style (`import * as A from "effect/Array"`) and added `Option` alias import (`import * as O from "effect/Option"`) with a local `formatOption` helper for concise output.
- Kept runtime inspection as one example, plus added source-aligned data-first and curried data-last invocations demonstrating both hit and miss behavior.
- Removed stale `probeNamedExportFunction` usage/import.

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/get.const.ts`
- Outcome: Passed (exit code 0). All examples completed successfully.

## Notes / residual risks
- Runtime inspection output (module export count / function preview) may vary with upstream `effect` package version changes, but behavioral examples for `Array.get` remained deterministic in this run.
