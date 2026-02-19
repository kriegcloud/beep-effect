## Changes made
- Replaced the generic callable probe example in `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Result/exports/gen.const.ts` with executable, semantics-focused `Result.gen` examples.
- Added a source-aligned composition example demonstrating `yield* Result.succeed(...)` values combining into `Success(3)`.
- Added a failure short-circuit example showing that yielding `Result.fail(...)` returns a `Failure` and skips later generator steps.
- Removed stale `probeNamedExportFunction` usage/import and added `formatUnknown` for concise result summaries.

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Result/exports/gen.const.ts`
- Outcome: Passed (exit code `0`). All three examples completed successfully.

## Notes / residual risks
- The runtime inspection example still logs a truncated function preview, which is intentional for quick export-shape visibility.
- Behavior shown is deterministic and aligned with the current `Result.gen` implementation and JSDoc contract.
