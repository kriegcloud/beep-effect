## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Cause/exports/isDone.const.ts` to replace the generic zero-arg callable probe with executable, semantically aligned `Cause.isDone` examples.
- Preserved the playground shell/top-level structure while cleaning imports:
  - Removed unused `probeNamedExportFunction`.
  - Added `effect/Exit` for deterministic failure-shape inspection.
- Implemented behavior-focused examples:
  - Runtime shape + arity check (`isDone.length`).
  - Source-aligned guard checks (`Cause.isDone(Cause.Done())` and `Cause.isDone("not done")`) plus a structural lookalike object to show brand-based runtime behavior.
  - `Cause.done(value)` failure extraction showing that the fail error is recognized by `Cause.isDone` and carries the completion payload.

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Cause/exports/isDone.const.ts`
- Outcome: Passed (exit code 0). All examples completed successfully.

## Notes / residual risks
- Examples are deterministic and align with the documented contract that `isDone` recognizes `Cause.Done(...)` values and rejects arbitrary non-`Done` inputs.
- Residual risk is limited to upstream `effect` runtime API/representation changes.
