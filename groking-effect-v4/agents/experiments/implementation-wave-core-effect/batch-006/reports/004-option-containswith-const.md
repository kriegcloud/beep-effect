## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Option/exports/containsWith.const.ts` to replace generic runtime inspection/probe examples with executable, behavior-focused `containsWith` examples.
- Removed stale helper usage/imports (`inspectNamedExport`, `probeNamedExportFunction`, and module-record reflection state).
- Added source-aligned strict-equivalence example using `Equivalence.strictEqual<number>()`.
- Added custom string-equivalence example (trimmed + case-insensitive) demonstrating both curried and uncurried invocation.

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Option/exports/containsWith.const.ts`
- Outcome: Passed (exit code `0`). Both examples executed successfully and logged expected boolean results.

## Notes / residual risks
- Validation was scoped to the required single-file run command; broader project checks (typecheck/lint/test suites) were not run in this task.
