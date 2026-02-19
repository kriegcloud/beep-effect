## Changes made
- Replaced generic runtime inspection/probe examples with executable, `Result.bindTo`-specific examples.
- Added a source-aligned example that runs `Result.succeed(42).pipe(Result.bindTo("answer"))` and logs the wrapped record.
- Added a do-notation continuation example showing `bindTo` seeding a chain for `bind` and `let`.
- Added a failure short-circuit example showing a failure remains unchanged and downstream `bind` logic is not invoked.
- Removed stale helper usage (`inspectNamedExport`, `probeNamedExportFunction`) and removed the now-unused `moduleRecord` value.

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Result/exports/bindTo.const.ts`
- Outcome: Passed (exit code 0). All examples completed, including source-aligned success, do-notation chaining, and failure short-circuit behavior.

## Notes / residual risks
- The examples validate runtime behavior for common success/failure paths, but they do not assert compile-time key-collision constraints that `bindTo` enforces at the type level.
