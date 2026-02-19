## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/liftPredicate.const.ts` to replace generic callable probing with executable, semantically aligned examples.
- Switched module alias import to `import * as A from "effect/Array"` and removed the unused `probeNamedExportFunction` helper import.
- Kept the runtime program shell and metadata sections intact.
- Added two behavior-focused examples:
  - Source-aligned `isEven` lifting demo (`to(1)` and `to(2)`).
  - Practical `flatMap` filtering via `liftPredicate((n) => n > 0)`.

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/liftPredicate.const.ts`
- Outcome: Passed (exit code `0`). All three examples completed successfully.

## Notes / residual risks
- Runtime shape inspection is still included (consistent with value-like export guidance) but examples are now primarily behavior-oriented.
- No additional residual risks identified from this single-file change.
