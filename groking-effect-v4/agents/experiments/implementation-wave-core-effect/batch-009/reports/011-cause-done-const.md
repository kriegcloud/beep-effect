## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Cause/exports/done.const.ts` only.
- Replaced generic callable probe content with executable, source-aligned examples for `Cause.done`.
- Removed stale `probeNamedExportFunction` import.
- Added behavior-focused examples that:
  - run `Cause.done(value)` and verify the failure contains a `Done` error carrying the value,
  - demonstrate shorthand equivalence with `Effect.fail(Cause.Done(value))`.

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Cause/exports/done.const.ts`
- Outcome: Passed (exit code 0). All three examples completed successfully.

## Notes / residual risks
- Equivalence is validated via identical pretty-printed cause output; if internal cause representation changes in future Effect versions, string-form comparison could become less stable than structural equality helpers.
