## Changes made
- Updated target file:
  - /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Schema/exports/Duration.interface.ts
- Replaced template reflection/probe examples with concrete executable `effect/Schema` flows tailored to this export.
- Preserved the top-level playground shell (Export Coordinates, Example Blocks, Program) and `BunRuntime.runMain(program)` entrypoint.
- Kept imports aligned with the finalized examples and removed unused generic probe helpers.

## Verification command + outcome
- Command: bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Schema/exports/Duration.interface.ts
- Outcome: Passed (exit code 0). All examples completed successfully.

## Notes / residual risks
- Coverage is behavior-focused for representative success/failure cases; not every edge case for the underlying Effect Schema API surface is exhaustively demonstrated.
