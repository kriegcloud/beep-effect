## Changes made
- Updated `src/effect/Array/exports/last.const.ts` to replace probe-only behavior with executable `Array.last` examples.
- Kept the runtime inspection example, removed `probeNamedExportFunction`, and added source-aligned invocation examples for non-empty and empty arrays.
- Added a queue-oriented example showing `Array.last` on object payloads with concise operational logging.
- Removed stale imports and aligned module aliases to `A` (`effect/Array`) and `O` (`effect/Option`).

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/last.const.ts`
- Outcome: Passed (exit code 0). All three examples completed successfully.

## Notes / residual risks
- Output rendering for `Option.some` uses `formatUnknown`, so formatting may differ slightly if runtime formatter behavior changes.
- No additional typecheck/lint suite was run beyond the required single-file execution.
