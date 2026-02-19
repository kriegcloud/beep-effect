## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/window.const.ts` to replace probe-only examples with executable, behavior-focused `Array.window` examples.
- Switched `effect/Array` import to the required alias form: `import * as A from "effect/Array"`.
- Removed stale reflection/probe utilities and related values (`inspectNamedExport`, `probeNamedExportFunction`, `moduleRecord`).
- Added two semantic examples:
  - Source-aligned sliding window usage with size `3` plus window count.
  - Boundary behavior showing exact-fit window and oversized-window empty result.

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/window.const.ts`
- Outcome: Passed (exit code `0`).
- Observed output included expected results:
  - `window([1, 2, 3, 4, 5], 3) -> [[1,2,3],[2,3,4],[3,4,5]]`
  - `window(["A", "B", "C", "D"], 5) -> []`

## Notes / residual risks
- Examples currently demonstrate data-first invocation; curried/data-last usage is not shown in this file.
- No additional typecheck/lint/test commands were run beyond the required `bun run` verification.
