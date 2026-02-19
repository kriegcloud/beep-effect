## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Option/exports/gen.const.ts` only.
- Replaced generic callable probe example with executable, semantics-focused `Option.gen` examples:
  - Source-aligned composition using `maybeName` and `maybeAge` to produce `Some({ name: "JOHN", age: 25 })`.
  - `None` short-circuit demonstration showing downstream generator code is skipped.
- Kept runtime inspection example and preserved top-level playground program shell.
- Removed stale `probeNamedExportFunction` import and added `formatUnknown` plus an `Option` result summarizer.
- Switched Option import alias to `import * as O from "effect/Option"` per alias guidance.

## Verification command + outcome
- Command:
  - `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Option/exports/gen.const.ts`
- Outcome:
  - Exit code `0`.
  - All three examples completed successfully, including source-aligned composition and `None` short-circuit behavior.

## Notes / residual risks
- The implementation is behaviorally aligned with the inline JSDoc example and confirmed at runtime.
- Residual risk is low; this is an executable demo file and does not change library internals.
