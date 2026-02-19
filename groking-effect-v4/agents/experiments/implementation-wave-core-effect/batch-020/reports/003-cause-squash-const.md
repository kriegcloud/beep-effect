## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Cause/exports/squash.const.ts` to replace the generic zero-arg callable probe with executable, semantics-focused examples.
- Kept the runtime inspection example and added source-aligned invocations for `Cause.squash(Cause.fail("error"))` and `Cause.squash(Cause.die("defect"))`.
- Added a priority/fallback example showing that `Fail` reasons are selected over `Die` reasons, and interrupt-only or empty causes squash to fallback `Error` values.
- Removed now-unused `probeNamedExportFunction` import and added `formatUnknown` for concise output formatting.

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Cause/exports/squash.const.ts`
- Outcome: Passed (exit code `0`). All three examples completed successfully.

## Notes / residual risks
- The module overview string is truncated in the generated source metadata (ends with "in this order:"); examples still validate concrete runtime precedence and fallback behavior.
