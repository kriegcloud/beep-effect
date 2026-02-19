## Changes made
- Updated target file:
  - /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Schema/exports/DateTimeUtcFromDate.interface.ts
- Replaced generic type-like probing with executable Date -> DateTime.Utc decoding and DateTime.Utc -> Date encoding examples.
- Preserved the top-level playground shell (Export Coordinates, Example Blocks, Program) and BunRuntime.runMain(program) entrypoint.
- Removed reflection/probe-only behavior and kept imports aligned with executable examples.

## Verification command + outcome
- Command: bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Schema/exports/DateTimeUtcFromDate.interface.ts
- Outcome: Passed (exit code 0). All examples completed successfully.

## Notes / residual risks
- Coverage is behavior-focused for representative success/failure cases; not every edge case for the underlying Effect Schema API surface is exhaustively demonstrated.
