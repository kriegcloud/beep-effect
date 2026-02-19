## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Cause/exports/isInterruptReason.const.ts` to replace generic zero-arg callable probing with semantically aligned examples for `Cause.isInterruptReason`.
- Kept the existing top-level runtime shell and export metadata structure.
- Removed stale `probeNamedExportFunction` import after replacing probe-only behavior.
- Added executable examples:
  - Source-aligned filtering of `Cause.interrupt(123)` reasons and reading `fiberId`.
  - Mixed-cause filtering showing only `Interrupt` reasons are retained and logging extracted `fiberId` values.

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Cause/exports/isInterruptReason.const.ts`
- Outcome: Passed (exit code 0). All three examples completed successfully.

## Notes / residual risks
- The mixed-cause example logs `undefined` for interrupt reasons created without an explicit fiber id; this reflects current runtime behavior and may vary if upstream `effect/Cause` semantics change.
