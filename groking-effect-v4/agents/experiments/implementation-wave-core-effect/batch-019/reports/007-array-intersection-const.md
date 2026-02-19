## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/intersection.const.ts` to replace probe-only behavior with executable, semantically aligned `intersection` examples.
- Removed the unused `probeNamedExportFunction` import and switched the `effect/Array` import alias to `A` per alias guidance.
- Kept runtime inspection and added two behavior-focused invocation examples:
  - Source-aligned two-argument call form.
  - Curried data-last form with an iterable (`Set`) plus left-order behavior demonstration.

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/intersection.const.ts`
- Outcome: Success (exit code `0`). All three examples completed and logs matched expected intersection behavior.

## Notes / residual risks
- The examples validate runtime behavior for primitive/string equality and iterable input handling.
- No additional edge-case coverage (for custom equality) was added here because that behavior is owned by `intersectionWith`.
