## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Option/exports/all.const.ts` while preserving the existing top-level playground structure and runtime shell.
- Replaced probe-only behavior with executable, source-aligned `Option.all` examples:
  - Kept runtime shape inspection for export visibility/context.
  - Added tuple collection semantics showing `Some` aggregation and `None` short-circuit.
  - Added struct collection semantics showing `Some` aggregation and `None` short-circuit.
- Removed stale callable-probe usage and switched the Option import to alias style (`import * as O from "effect/Option"`).

## Verification command + outcome
- Command:
  - `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Option/exports/all.const.ts`
- Outcome:
  - Exit code `0`.
  - All three playground examples completed successfully.

## Notes / residual risks
- Examples cover tuple and struct inputs from the source documentation; iterable-specific behavior is not separately demonstrated in this file.
