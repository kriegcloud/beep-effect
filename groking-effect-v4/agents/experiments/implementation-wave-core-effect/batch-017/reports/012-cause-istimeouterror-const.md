## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Cause/exports/isTimeoutError.const.ts` to replace the generic callable probe with executable, source-aligned guard examples.
- Kept the runtime inspection example, improved it with explicit guard arity logging.
- Added a source-aligned invocation example matching JSDoc intent:
  - `Cause.isTimeoutError(new Cause.TimeoutError("Timed out"))`
  - `Cause.isTimeoutError("nope")`
- Added a structural-brand behavior example comparing `TimeoutError`, `NoSuchElementError`, and a branded plain object.
- Removed the now-unused `probeNamedExportFunction` import.

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Cause/exports/isTimeoutError.const.ts`
- Outcome: Passed (exit code 0). All three examples completed successfully and produced expected guard results (`true` for `TimeoutError`, `false` for non-matching values, structural brand check shown).

## Notes / residual risks
- The structural brand check confirms current runtime behavior is brand-property based; if upstream guard internals change from structural to nominal checks, this example output may change.
