## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/partition.const.ts` to replace probe-only behavior with executable, source-aligned `Array.partition` examples.
- Switched `effect/Array` import to alias style (`import * as A from "effect/Array"`) and removed stale `probeNamedExportFunction` usage/import.
- Kept runtime inspection example, then added concrete behavior examples for:
  - data-first invocation aligned to JSDoc (`[1,2,3,4]` split to odds/evens),
  - data-last/curried invocation using index-aware predicate,
  - refinement predicate splitting `ReadonlyArray<number | string>` into strings vs numbers.

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/partition.const.ts`
- Outcome: Success (exit code `0`). All four examples completed and logged expected partition outputs.

## Notes / residual risks
- Validation used runtime execution via Bun; no separate static type-check/lint pass was run in this task.
- Example outputs are deterministic and aligned to current `effect/Array.partition` behavior observed in this workspace.
