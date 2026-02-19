## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/union.const.ts` to replace reflection/probe examples with executable `Array.union` examples.
- Switched `effect/Array` import to alias style `import * as A from "effect/Array"`.
- Removed stale helper usage/imports (`inspectNamedExport`, `probeNamedExportFunction`, and `moduleRecord`).
- Added three behavior-focused examples:
  - Source-aligned two-argument union invocation.
  - Curried/data-last union invocation.
  - Reference-equality behavior with object inputs.

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/union.const.ts`
- Outcome: Passed (exit code `0`). All examples completed successfully and runtime reported `BunRuntime.runMain detected: true`.

## Notes / residual risks
- The object example demonstrates effective deduplication for repeated references; it does not exhaustively document custom equality strategies (covered by `unionWith`).
