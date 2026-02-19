## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/setHeadNonEmpty.const.ts` to replace generic inspection/probe-only examples with executable, behavior-focused examples for `setHeadNonEmpty`.
- Switched `effect/Array` import to alias style `import * as A from "effect/Array"`.
- Removed stale runtime probe helpers and module-record plumbing (`inspectNamedExport`, `probeNamedExportFunction`, and `moduleRecord`).
- Added three concrete examples:
  - Runtime contract snapshot (`typeof`, runtime arity, and non-empty contract note).
  - Source-aligned invocation (`setHeadNonEmpty([1, 2, 3], 10)`).
  - Curried/data-last invocation including singleton input behavior.

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/setHeadNonEmpty.const.ts`
- Outcome: Passed (exit code `0`). All three examples completed successfully and produced expected head-replacement outputs.

## Notes / residual risks
- Examples intentionally use only non-empty arrays; runtime behavior for empty arrays is not exercised because this export’s contract is non-empty input.
