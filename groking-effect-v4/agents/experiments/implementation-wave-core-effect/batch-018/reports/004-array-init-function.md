## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/init.function.ts` to replace probe-only invocation with executable, source-aligned examples.
- Kept function discovery example and preserved the existing top-level program shell.
- Added two concrete runtime examples:
  - Non-empty source-aligned call: `init([1, 2, 3, 4]) -> [1, 2, 3]`
  - Empty-array boundary: `init([]) -> undefined`
- Removed the unused `probeNamedExportFunction` import.
- Switched array module alias to `A` to match alias-style guidance.

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/init.function.ts`
- Outcome: Passed (exit code 0). All three examples completed successfully.

## Notes / residual risks
- Behavior is deterministic for the covered inputs and matches the source JSDoc examples.
- Residual risk is low; coverage is example-level (not a formal test suite assertion).
