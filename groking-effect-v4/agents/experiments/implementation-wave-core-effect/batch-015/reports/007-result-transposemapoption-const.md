## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Result/exports/transposeMapOption.const.ts` to replace the generic zero-arg callable probe with executable, source-aligned `transposeMapOption` examples.
- Kept the existing top-level playground structure and runtime shell (`createPlaygroundProgram` + `BunRuntime.runMain`).
- Added `effect/Option` import as `O` (per alias rule), removed stale `probeNamedExportFunction` usage/import, and added behavior-focused formatting helpers for concise result logs.
- Added two semantic behavior examples beyond runtime inspection:
  - Source-aligned parse flow for `Option.some("42")` and `Option.none()` with parse-call counting.
  - Failure propagation flow showing success for valid integer input and failure for invalid integer input.

## Verification command + outcome
- Command:
  - `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Result/exports/transposeMapOption.const.ts`
- Outcome:
  - Passed (exit code `0`).
  - All three examples completed successfully, including documented Some/None behavior and failure propagation.

## Notes / residual risks
- The implementation is aligned to observed runtime behavior of the current Effect build (dual callable shape and transposition semantics).
- Residual risk is low; future upstream API/signature changes in `effect/Result.transposeMapOption` could require example updates.
