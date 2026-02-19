## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/scan.const.ts` to replace runtime-inspection/probe-only examples with executable `Array.scan` examples.
- Added source-aligned data-first usage showing running totals and `input.length + 1` output shape.
- Added curried data-last usage showing intermediate inventory snapshots.
- Added empty-input example confirming scan still returns a non-empty result containing the seed.
- Removed stale helper usage/imports (`inspectNamedExport`, `probeNamedExportFunction`, module-record reflection value) and switched Array import alias to `A`.

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/scan.const.ts`
- Outcome: Passed (exit code 0). All three examples completed successfully and `BunRuntime.runMain detected: true`.

## Notes / residual risks
- No additional automated checks were run beyond the required command.
- `scanRight.const.ts` in the same folder still appears probe-only, but it was out of scope for this ownership-constrained task.
