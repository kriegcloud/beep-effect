## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/extend.const.ts` to replace the generic callable zero-arg probe with executable, semantically aligned `Array.extend` examples.
- Kept runtime inspection as a lightweight first example, then added:
  - Source-aligned data-first invocation: `extend([1,2,3], (as) => as.length)`.
  - Curried invocation with deterministic suffix-sum behavior, including empty-array behavior.
- Removed stale helper usage/import (`probeNamedExportFunction`) and switched `effect/Array` import alias to `A` per prompt style.

## Verification command + outcome
- Command:
  - `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/extend.const.ts`
- Outcome:
  - Exit code `0`.
  - All three examples completed successfully.
  - Observed key outputs:
    - `extend([1,2,3], (as) => as.length) => [3,2,1]`
    - `extend(sumSuffix)([10,20,30,40]) => [100,90,70,40]`
    - `extend(sumSuffix)([]) => []`

## Notes / residual risks
- The referenced source path in the file header (`.repos/effect-smol/...`) was not present locally; behavior alignment was validated against installed `effect` source (`extend` as `dual(2)` suffix mapping).
- Examples are deterministic and runtime-verified; no additional residual behavioral risks identified for this file scope.
