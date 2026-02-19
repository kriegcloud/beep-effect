## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/makeBy.const.ts` to replace generic callable probing with executable `Array.makeBy` examples.
- Switched the module import alias to `import * as A from "effect/Array"` and updated `moduleRecord` accordingly.
- Removed the stale `probeNamedExportFunction` import and probe example block.
- Added concrete behavior examples:
  - Source-aligned invocation: `A.makeBy(5, (n) => n * 2)`.
  - Normalization behavior for `n` (fractional, zero, negative values).
  - Dual invocation equivalence (direct and curried forms).

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/makeBy.const.ts`
- Outcome: Passed (exit code `0`).
- Observed behavior:
  - Source example produced `[0, 2, 4, 6, 8]`.
  - Normalization example showed `3.7 -> length 3`, `0 -> length 1`, `-2 -> length 1`.
  - Direct and curried invocation outputs matched.

## Notes / residual risks
- The examples validate runtime behavior and docs alignment for representative inputs, but they are not exhaustive property tests across all numeric edge cases (e.g., very large `n`).
