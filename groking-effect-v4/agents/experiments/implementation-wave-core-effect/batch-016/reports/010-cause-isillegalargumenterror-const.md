## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Cause/exports/isIllegalArgumentError.const.ts` to replace the generic zero-arg callable probe with executable, source-aligned `Cause.isIllegalArgumentError` examples.
- Removed stale helper import `probeNamedExportFunction`.
- Added deterministic behavioral examples:
  - Source-aligned invocation with `new Cause.IllegalArgumentError("Expected positive number")` and `"nope"`.
  - Guard discrimination across `IllegalArgumentError`, `TimeoutError`, and `Error`.
- Kept runtime inspection example and preserved the file's top-level structure/program shell.

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Cause/exports/isIllegalArgumentError.const.ts`
- Outcome: Passed (exit code 0). All examples completed successfully.

## Notes / residual risks
- The implementation relies on current `effect/Cause` runtime constructors and guard behavior (`IllegalArgumentError`, `TimeoutError`, and `isIllegalArgumentError`). If upstream semantics change, example outputs may change accordingly.
