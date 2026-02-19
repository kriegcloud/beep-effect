## Changes made
- Replaced generic runtime inspection/callable probe examples in `DoneTypeId.const.ts` with two executable, semantics-focused examples.
- Added a `Done` branding round-trip example that creates `Cause.Done(...)` and verifies its branded field matches `Cause.DoneTypeId`.
- Added a discrimination example comparing `Done` and `Fail` reasons via marker presence and `Cause.isDone` results.
- Removed now-unused generic probe helpers/imports and stale `moduleRecord` value.

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Cause/exports/DoneTypeId.const.ts`
- Outcome: Passed (exit code 0). Both examples completed successfully and the demo finished for `effect/Cause.DoneTypeId`.

## Notes / residual risks
- `DoneTypeId` is represented as a runtime string marker in this build; the examples validate behavior through `Cause.Done(...)` and `Cause.isDone(...)` rather than relying on compile-time nominal guarantees.
