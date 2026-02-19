## Changes made
- Replaced the generic zero-argument callable probe with source-aligned, executable guard checks for `Cause.isExceededCapacityError`.
- Kept runtime shape inspection, and added arity logging (`length === 1`) to clarify invocation contract.
- Added a structural-brand example comparing `ExceededCapacityError` vs `TimeoutError`, plus a branded plain object, with an explicit contract note about structural guard behavior.
- Removed stale `probeNamedExportFunction` import after example replacement.

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Cause/exports/isExceededCapacityError.const.ts`
- Outcome: Pass (exit code 0). All three examples completed successfully.

## Notes / residual risks
- The structural-brand example intentionally demonstrates runtime permissiveness (`hasProperty`-based check), which may be broader than nominal class identity expectations.
