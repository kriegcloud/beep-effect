## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Cause/exports/hasInterrupts.const.ts` to replace the generic zero-arg callable probe with source-aligned executable examples.
- Kept runtime shape inspection, then added:
  - A direct JSDoc-aligned invocation comparing `Cause.interrupt(123)` vs `Cause.fail("error")`.
  - A mixed-cause example demonstrating detection across `Cause.combine(...)` inputs with and without an `Interrupt` reason.
- Removed the now-unused `probeNamedExportFunction` import.

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Cause/exports/hasInterrupts.const.ts`
- Outcome: Success (exit code 0). All three examples completed and logged expected predicate behavior.

## Notes / residual risks
- The examples rely on current `effect/Cause` runtime shapes (e.g., reason `_tag` values); if upstream internals change, log text may differ while predicate behavior remains correct.
