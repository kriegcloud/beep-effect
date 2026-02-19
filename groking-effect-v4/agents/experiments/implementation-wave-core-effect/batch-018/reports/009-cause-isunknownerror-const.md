## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Cause/exports/isUnknownError.const.ts` to replace the generic zero-arg probe with executable, source-aligned examples.
- Preserved top-level runtime shell and export metadata while improving example semantics:
  - Runtime inspection + callable arity check.
  - Source JSDoc-aligned invocation (`UnknownError` => `true`, non-matching value => `false`).
  - Structural brand-discrimination example using `UnknownErrorTypeId` to reflect actual guard behavior.
- Removed stale helper import `probeNamedExportFunction` after refactor.

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Cause/exports/isUnknownError.const.ts`
- Outcome: Passed (exit code `0`), all examples completed successfully.

## Notes / residual risks
- The structural-brand example demonstrates current runtime behavior (brand-property presence). If upstream implementation switches from structural to nominal checks, that example output would change.
