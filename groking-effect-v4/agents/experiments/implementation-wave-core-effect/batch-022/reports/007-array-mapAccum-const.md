## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/mapAccum.const.ts` to replace the generic zero-arg callable probe with deterministic, semantics-aligned `mapAccum` examples.
- Kept the runtime inspection example, but tightened its log copy to focus on runtime shape prior to behavior demos.
- Added a source-aligned data-first example that computes running totals and logs both final accumulator and mapped outputs.
- Added a data-last curried example that uses the callback index to produce labeled outputs and logs final processed count.
- Removed stale `probeNamedExportFunction` usage and switched `effect/Array` import alias to `A` to match batch alias guidance.

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/mapAccum.const.ts`
- Outcome: Success (exit code `0`).
- Observed key outputs:
  - `A.mapAccum([1,2,3], 0, sum) => [6, [1,3,6]]`
  - `A.mapAccum(0, f)(["one","two","three"]) => [3, ["0:ONE","1:TWO","2:THREE"]]`

## Notes / residual risks
- Examples cover both data-first and data-last usage and align with source intent.
- No functional risks identified from this single-file change; broader consistency across other `mapAccum` exports (e.g., `Chunk`, `Stream`) is outside this task’s ownership scope.
