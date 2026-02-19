## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Cause/exports/ExceededCapacityError.interface.ts` to replace the reflection-only module-context example with executable, source-aligned runtime behavior.
- Kept the existing top-level structure/import contract/runtime shell intact.
- Added a bridge-oriented first example that still performs type-erasure inspection and now inspects the runtime constructor companion (`Cause.ExceededCapacityError`).
- Added a runtime companion flow that constructs `new Cause.ExceededCapacityError("Queue full")` and validates behavior with `Cause.isExceededCapacityError` for both positive and negative inputs.

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Cause/exports/ExceededCapacityError.interface.ts`
- Outcome: Passed (exit code 0). Both examples completed successfully and logged expected constructor/guard behavior.

## Notes / residual risks
- The type-like symbol name (`ExceededCapacityError`) intentionally appears at runtime because the module also exports a constructor companion with the same name; this can look counterintuitive when discussing type erasure but is expected for this API shape.
