## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/unzip.const.ts` to replace probe-only behavior with semantic, executable examples for `Array.unzip`.
- Kept the program shell and top-level section structure intact (`Export Coordinates`, `Example Blocks`, `Program`, `BunRuntime.runMain`).
- Removed stale callable-probe helper usage:
  - Dropped `probeNamedExportFunction` import.
  - Removed the zero-arg callable probe example block.
- Switched `effect/Array` import to alias style (`import * as A from "effect/Array"`) and updated `moduleRecord` accordingly.
- Added behavior-focused examples:
  - Source-aligned split of documented pair input.
  - Zip/unzip inverse-flow demonstration showing zip truncation impact before unzip.

## Verification command + outcome
- Command:
  - `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/unzip.const.ts`
- Outcome:
  - Exit code `0`.
  - All three examples completed successfully.
  - Logged expected unzip outputs:
    - `[[1,2,3],["a","b","c"]]` for the source-aligned input.
    - Zip/unzip flow preserved paired values from the truncated zipped result.

## Notes / residual risks
- The runtime inspection preview includes internal function rendering that may vary slightly across Effect/runtime versions.
- Example behavior is deterministic and does not depend on environment state.
