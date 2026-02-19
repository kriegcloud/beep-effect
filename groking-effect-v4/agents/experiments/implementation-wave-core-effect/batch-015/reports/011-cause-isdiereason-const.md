## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Cause/exports/isDieReason.const.ts` to replace the generic zero-arg callable probe with executable, source-aligned `isDieReason` examples.
- Kept the runtime inspection example and added:
  - A documented-flow example using `Cause.die("defect")` with `cause.reasons.filter(Cause.isDieReason)`.
  - A mixed-reason filtering example using `Cause.fromReasons(...)` to show only `Die` reasons are retained.
- Removed the now-unused `probeNamedExportFunction` import.

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Cause/exports/isDieReason.const.ts`
- Outcome: Passed (exit code `0`). All three examples completed successfully.

## Notes / residual risks
- The examples rely on current `effect/Cause` runtime shapes (`Reason._tag`, `Die.defect`); if upstream runtime representation changes, output formatting may differ while semantics remain the same.
