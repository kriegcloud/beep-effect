## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Option/exports/zipWith.const.ts` to replace probe-only behavior with executable, source-aligned `Option.zipWith` examples.
- Switched the `effect/Option` import to alias style (`import * as O from "effect/Option"`).
- Removed stale probe helper usage (`probeNamedExportFunction`) and added focused examples:
  - Source-aligned `Some` + `Some` and `Some` + `None` invocation.
  - Combiner-call guard showing the combining function runs only when both inputs are `Some`.

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Option/exports/zipWith.const.ts`
- Outcome: Passed (exit code `0`).

## Notes / residual risks
- No additional residual risks identified from this isolated export demo update.
