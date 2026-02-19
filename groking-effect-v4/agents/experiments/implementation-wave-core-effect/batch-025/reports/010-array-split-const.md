## Changes made
- Replaced generic runtime inspection / zero-arg probe examples in `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/split.const.ts` with executable, behavior-focused `Array.split` examples.
- Switched `effect/Array` import style to `import * as A from "effect/Array"` and removed stale reflection/probe helper imports.
- Added two semantically aligned examples:
  - Source-aligned split of 8 values into 3 groups with logged chunk sizes.
  - Curried `split(4)` invocation on a `Set`, plus a boundary case where requested group count exceeds input length.

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/split.const.ts`
- Outcome: Passed (exit code 0).
- Observed behavior:
  - `split([1, 2, 3, 4, 5, 6, 7, 8], 3) -> [[1,2,3],[4,5,6],[7,8]]`
  - `split(4)(Set tasks) -> [["ingest","validate"],["enrich","store"],["publish","notify"]]`
  - `split(["a", "b", "c", "d"], 8) -> [["a"],["b"],["c"],["d"]]`

## Notes / residual risks
- Examples intentionally demonstrate current runtime behavior from documented and boundary-style inputs, but they do not exhaustively cover all edge cases (for example `n <= 0`).
