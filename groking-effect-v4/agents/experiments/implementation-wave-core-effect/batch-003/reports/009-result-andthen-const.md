## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Result/exports/andThen.const.ts` to replace the zero-arg callable probe with executable `andThen` behavior demos.
- Kept runtime inspection, then added semantic examples for documented `andThen` input shapes:
  - function returning `Result`
  - function returning plain value
  - `Result` value
  - plain constant value
- Added a failure short-circuit example that verifies mapper laziness (`mapperInvoked: false`).
- Removed the stale `probeNamedExportFunction` import and introduced `formatUnknown` for concise `Result` summaries.

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Result/exports/andThen.const.ts`
- Outcome: Passed (exit code `0`).
- Key output signals:
  - Supported input shapes all produced expected `Success(...)` values.
  - Failure path preserved `Failure(input-failure)` and did not invoke mapper logic.

## Notes / residual risks
- The examples validate runtime behavior for representative success/failure paths, but they are still demo-style checks rather than assertion-based tests.
- Logging uses concise string summaries; if internal `Result` structure changes, summaries remain behavior-focused rather than structural snapshots.
