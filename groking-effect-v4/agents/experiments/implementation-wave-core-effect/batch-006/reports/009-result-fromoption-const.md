## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Result/exports/fromOption.const.ts` to replace generic runtime inspection/probe examples with executable, source-aligned behavior examples.
- Removed stale helper usage/imports (`inspectNamedExport`, `probeNamedExportFunction`, `moduleRecord`) and added only needed imports (`formatUnknown`, `effect/Option` as `O`).
- Added two deterministic examples:
  - Data-first conversion for `Option.some` and `Option.none`.
  - Curried/data-last form showing `onNone` laziness (called only for `None`).

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Result/exports/fromOption.const.ts`
- Outcome: Passed (exit code `0`), both examples completed successfully.

## Notes / residual risks
- Verification was limited to the required single-file Bun run.
- Broader repo-wide typecheck/lint/test suites were not run in this task.
