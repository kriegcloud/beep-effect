## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Cause/exports/findDefect.const.ts` to replace generic callable probing with executable, semantics-focused `Cause.findDefect` examples.
- Kept the existing top-level runtime shell and structure (`createPlaygroundProgram`, section layout, `BunRuntime.runMain`).
- Added source-aligned behavior example showing successful defect extraction from `Cause.die(...)` and identity preservation.
- Added no-defect contract example showing `Result.Failure` behavior and original-cause preservation when no `Die` reason exists.
- Removed stale probe helper import and added only needed utilities (`formatUnknown`, `ResultModule`).

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Cause/exports/findDefect.const.ts`
- Outcome: Passed (exit code 0). All 3 examples completed successfully.

## Notes / residual risks
- The examples validate key observable runtime contracts (`success` extraction, failure-channel preservation, and cause identity), but they do not exhaustively test ordering across all possible combined-cause constructions.
