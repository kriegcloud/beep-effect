## Changes made
- Updated target file:
  - /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Schema/exports/DateTimeUtcFromMillis.interface.ts
- Replaced probes with millis conversion examples that show decode/encode semantics and failure on non-number decode input.
- Preserved the top-level playground shell (Export Coordinates, Example Blocks, Program) and BunRuntime.runMain(program) entrypoint.
- Removed reflection/probe-only behavior and kept imports aligned with executable examples.

## Verification command + outcome
- Command: bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Schema/exports/DateTimeUtcFromMillis.interface.ts
- Outcome: Passed (exit code 0). All examples completed successfully.

## Notes / residual risks
- Coverage is behavior-focused for representative success/failure cases; not every edge case for the underlying Effect Schema API surface is exhaustively demonstrated.
