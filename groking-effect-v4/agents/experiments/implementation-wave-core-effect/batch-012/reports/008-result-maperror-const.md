## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Result/exports/mapError.const.ts` to replace the generic callable probe with executable, source-aligned `Result.mapError` examples.
- Added a `summarizeResult` helper using `Result.match` + `formatUnknown` for concise behavior-focused logging.
- Added two semantic examples:
  - Source-aligned failure mapping from the JSDoc pattern, plus explicit Success-pass-through behavior.
  - Data-first invocation with mapper call counting to show mapper execution only on `Failure`.
- Removed stale `probeNamedExportFunction` import and kept the existing top-level runtime shell (`createPlaygroundProgram` + `BunRuntime.runMain`).

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Result/exports/mapError.const.ts`
- Outcome: **Failed**
- Error:
  - `Cannot find module '@effect/platform-bun/BunContext' from '/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/runtime/Playground.ts'`

## Notes / residual risks
- The implementation changes are complete and scoped to the owned export file, but runtime verification is currently blocked by missing environment dependencies unrelated to this file's logic.
