## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Option/exports/orElse.const.ts`.
- Replaced the generic zero-arg callable probe with executable, source-aligned `Option.orElse` examples.
- Added `formatUnknown` logging for concrete output readability.
- Switched `effect/Option` import alias to `O` and removed now-unused probe helper import.
- Kept the existing program shell and runtime inspection example, and added two behavior-focused examples:
  - JSDoc-aligned fallback behavior for `None` vs `Some`.
  - Lazy fallback thunk evaluation (called only for `None`).

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Option/exports/orElse.const.ts`
- Outcome: Passed (exit code 0). All three examples completed successfully.

## Notes / residual risks
- Behavior demonstrated is deterministic for the covered `orElse` paths (`None` fallback and `Some` passthrough).
- Residual risk is low; this file-level verification does not cover broader cross-module integration scenarios.
