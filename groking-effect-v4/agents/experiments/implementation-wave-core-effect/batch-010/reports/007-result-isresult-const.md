## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Result/exports/isResult.const.ts` to replace the generic callable probe with executable, source-aligned `isResult` examples.
- Kept runtime inspection and added two behavior-focused examples:
  - Reproduces the JSDoc check (`Result.succeed(1)` vs `{ value: 1 }`).
  - Uses `isResult` as a predicate to filter mixed values and summarize recognized `Success` / `Failure` values.
- Removed stale helper usage by dropping `probeNamedExportFunction` and importing `formatUnknown` for readable result summaries.

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Result/exports/isResult.const.ts`
- Outcome: Passed (exit code `0`). All three examples completed successfully.

## Notes / residual risks
- The examples intentionally use constructor-produced `Result` values and plain non-`Result` values; they do not attempt to validate edge-case structural mimics of internal tagging.
