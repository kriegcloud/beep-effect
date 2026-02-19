## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Result/exports/fromNullishOr.const.ts` to replace the generic zero-arg callable probe with source-aligned executable examples for `Result.fromNullishOr`.
- Kept the existing playground shell and top-level structure intact.
- Removed the now-unused `probeNamedExportFunction` import.
- Added two behavior-focused examples:
  - Non-nullish input returns `Success`.
  - Nullish input uses `onNullish` callback and returns `Failure`.

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Result/exports/fromNullishOr.const.ts`
- Outcome: Passed (exit code `0`).
- Runtime result: all three examples completed successfully, including the new success/failure behavior examples.

## Notes / residual risks
- The failure-case example currently demonstrates `undefined`; behavior for `null` follows the same contract but is not shown in a separate example block.
