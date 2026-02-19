## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Option/exports/liftThrowable.const.ts` to replace generic callable probing with executable, behavior-focused `Option.liftThrowable` examples.
- Kept runtime inspection example and added source-aligned JSON parsing behavior (`Some` for valid JSON, `None` for parse failure).
- Added a second deterministic throwing-function example using `decodeURIComponent` to show malformed input recovery to `None`.
- Removed stale probe helper import and switched the `effect/Option` import to the required alias style (`import * as O from "effect/Option"`).

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Option/exports/liftThrowable.const.ts`
- Outcome: Passed (exit code `0`). All three examples completed successfully.

## Notes / residual risks
- Examples rely on current `effect/Option` runtime rendering of `Some`/`None`; representation formatting could vary across future library versions.
- Behavior demonstrated is deterministic for the provided inputs.
