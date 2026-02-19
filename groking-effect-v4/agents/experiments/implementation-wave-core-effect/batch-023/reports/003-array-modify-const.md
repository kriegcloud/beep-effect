## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/modify.const.ts` to replace the generic callable probe with executable, semantically aligned `Array.modify` examples.
- Kept runtime inspection and added two behavior-focused examples:
  - Source-aligned invocation demonstrating in-bounds modification and out-of-bounds `undefined` behavior.
  - Curried/data-last invocation against an iterable (`Set`) plus short-input `undefined` behavior.
- Removed stale helper import `probeNamedExportFunction`, added `formatUnknown` for concise deterministic output, and applied the requested array alias style (`import * as A from "effect/Array"`).

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/modify.const.ts`
- Outcome: Success (exit code `0`).
- Observed behavior:
  - In-range index modification produced `[1, 2, 6, 4]`.
  - Out-of-bounds index returned `undefined`.
  - Curried call modified iterable input as expected and returned `undefined` for insufficient length.

## Notes / residual risks
- Examples are deterministic and aligned with current `effect/Array.modify` dual invocation contract.
- Runtime inspection output includes internal function preview text that may vary across upstream implementation changes.
