## Changes made
- Replaced generic runtime inspection/probe examples in `scanRight.const.ts` with executable, source-aligned `Array.scanRight` usage.
- Switched Array import alias to `import * as A from "effect/Array"` per batch alias rules.
- Removed stale helper usage/imports (`inspectNamedExport`, `probeNamedExportFunction`, and module-record reflection value) that became unnecessary.
- Added three behavior-focused examples:
  - Documented direct invocation with reverse running totals.
  - Curried/data-last invocation showing suffix snapshots.
  - Empty-input behavior showing the initial accumulator is preserved.

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/scanRight.const.ts`
- Outcome: Pass (exit code `0`). All three examples executed successfully and produced expected right-to-left scan outputs.

## Notes / residual risks
- Validation was scoped to the required playground runtime execution for this single export file.
- No additional repository-wide typecheck/lint/test suite was run as part of this batch task.
