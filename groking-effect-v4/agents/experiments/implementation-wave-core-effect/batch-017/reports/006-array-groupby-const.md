## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/groupBy.const.ts` to replace generic zero-arg probe behavior with executable `groupBy` examples.
- Kept the existing top-level playground program shell and runtime inspection example.
- Switched the `effect/Array` import alias to `A` and removed the unused probe helper import.
- Added two behavior-focused invocations:
  - Source-aligned grouping of people by `group`.
  - Grouping numbers by derived sign key plus empty-array behavior.

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/groupBy.const.ts`
- Outcome: Passed (exit code 0). All three examples completed successfully.

## Notes / residual risks
- Examples validate representative runtime behavior and call shape, but do not exhaustively cover all key-generation edge cases (for example, non-string key coercion subtleties).
