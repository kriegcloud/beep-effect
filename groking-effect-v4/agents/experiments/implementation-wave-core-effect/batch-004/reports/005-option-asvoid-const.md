## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Option/exports/asVoid.const.ts` to replace generic runtime inspection/probe examples with executable, semantics-focused `Option.asVoid` examples.
- Added two concrete examples aligned with source JSDoc behavior:
  - `Some` input becomes `Some(undefined)` (validated by predicate in log output).
  - `None` input remains `None`.
- Removed stale helper usage (`inspectNamedExport`, `probeNamedExportFunction`, `moduleRecord`) and switched the Option import alias to `O` per alias guidance.
- Preserved the top-level structure and existing playground program shell.

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Option/exports/asVoid.const.ts`
- Outcome: Passed (exit code `0`). Both examples completed successfully and the program finished with `Demo complete for effect/Option.asVoid`.

## Notes / residual risks
- `formatUnknown` uses JSON serialization for objects, so `Some(undefined)` prints without a `value` field; the example explicitly logs a boolean check to confirm the `Some` value is `undefined`.
