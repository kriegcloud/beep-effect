## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/dedupe.const.ts` to replace probe-only behavior with executable, source-aligned `dedupe` examples.
- Switched `effect/Array` import alias to `A` to match required alias style.
- Removed stale `probeNamedExportFunction` usage and import.
- Kept runtime shell and top-level section structure intact.
- Added concrete examples:
  - Source JSDoc-aligned invocation (`A.dedupe([1, 2, 1, 3, 2, 4])`).
  - Structural-equality + first-occurrence retention behavior with object inputs.

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/dedupe.const.ts`
- Outcome: **Passed** (exit code `0`).
- Runtime output confirmed all three examples completed successfully and logged expected dedupe behavior.

## Notes / residual risks
- Structural-object example demonstrates current `Equal.equivalence()` behavior; future upstream changes to `effect/Equal` semantics could alter this behavior.
- The runtime inspection example still includes reflection logs by design, but invocation behavior is now demonstrated with concrete, semantically aligned examples.
