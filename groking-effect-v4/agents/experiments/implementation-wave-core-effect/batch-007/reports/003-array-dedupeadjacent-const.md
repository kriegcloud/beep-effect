## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/dedupeAdjacent.const.ts` to replace the generic callable probe with executable, semantically aligned `dedupeAdjacent` examples.
- Preserved the existing playground shell and top-level section structure (`Export Coordinates`, `Example Blocks`, `Program`, `BunRuntime.runMain`).
- Removed stale helper import `probeNamedExportFunction` and applied the required alias style for array imports (`import * as A from "effect/Array"`).
- Added two behavior-focused invocations in addition to runtime inspection:
  - Source-aligned adjacent deduplication (`[1, 1, 2, 2, 3, 3] -> [1, 2, 3]`).
  - Contrast case proving non-adjacent duplicates are preserved (`[1, 2, 1, 2, 2, 3, 3, 2] -> [1, 2, 1, 2, 3, 2]`).

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/dedupeAdjacent.const.ts`
- Outcome: Success (exit code `0`). All three examples completed and the program finished with `✅ Demo complete for effect/Array.dedupeAdjacent`.

## Notes / residual risks
- Runtime inspection preview text depends on upstream function rendering and may vary across Effect/runtime versions, but behavior-focused examples are deterministic.
