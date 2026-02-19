## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Cause/exports/interrupt.const.ts` to replace the generic callable probe example with executable, source-aligned behavior examples for `Cause.interrupt`.
- Removed stale `probeNamedExportFunction` import and added two focused examples:
  - Source-aligned example showing a single Interrupt reason for `Cause.interrupt(123)`.
  - Optional argument example comparing `Cause.interrupt(7)` and `Cause.interrupt()` fiberId behavior.
- Kept existing top-level structure, runtime shell (`BunRuntime.runMain(program)`), and runtime inspection example.

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Cause/exports/interrupt.const.ts`
- Outcome: Passed (exit code `0`). All three examples completed successfully.

## Notes / residual risks
- Behavior was validated against the currently installed `effect/Cause` runtime. If upstream library semantics change, example logs may need refresh.
