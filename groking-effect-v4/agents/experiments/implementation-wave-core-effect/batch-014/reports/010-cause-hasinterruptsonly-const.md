## Changes made
- Replaced the generic zero-arg callable probe in `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Cause/exports/hasInterruptsOnly.const.ts` with executable, behavior-focused examples for `Cause.hasInterruptsOnly`.
- Kept runtime shape inspection and added a source-aligned invocation block covering `Cause.interrupt(123)`, `Cause.fail("error")`, and `Cause.empty`.
- Added a combined-cause example to show `interrupt + interrupt` stays `true` while `interrupt + fail` and `interrupt + die` are `false`.
- Added an explicit contract note when runtime behavior for `Cause.empty` diverges from the summary/JSDoc expectation.
- Removed stale `probeNamedExportFunction` import and its helper example.

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Cause/exports/hasInterruptsOnly.const.ts`
- Outcome: Passed (exit code `0`). All three examples completed and `BunRuntime.runMain` was detected.

## Notes / residual risks
- Runtime currently reports `hasInterruptsOnly(Cause.empty) === true`, which conflicts with the module summary/JSDoc text that says empty should be `false`; the example now logs this contract mismatch explicitly.
- Residual risk is low for this export file; no cross-file changes were made.
