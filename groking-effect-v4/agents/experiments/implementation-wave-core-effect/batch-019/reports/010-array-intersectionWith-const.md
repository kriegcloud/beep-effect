## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/intersectionWith.const.ts` to replace the generic callable probe with executable, source-aligned examples for `Array.intersectionWith`.
- Kept runtime inspection and added behavior-focused examples for:
  - The documented object-by-id intersection shape (`intersectionWith(byId)(array2)(array1)`).
  - The two-argument overload (`intersectionWith(byId)(array1, array2)`).
  - Case-insensitive string intersection to highlight that result ordering follows the first array.
- Switched the `effect/Array` import alias to `A` and removed the stale `probeNamedExportFunction` import.

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/intersectionWith.const.ts`
- Outcome: Passed (exit code `0`).
- Observed key outputs:
  - `intersectionWith(byId)(array2)(array1) -> [1, 3]`
  - `intersectionWith(byId)(array1, array2) -> [1, 3]`
  - `caseInsensitive(left, right) -> [BETA, Alpha, beta]`

## Notes / residual risks
- Examples are deterministic and align with current `effect/Array` semantics; if future library versions change duplicate handling or overload behavior, these logs may need refresh.
- No edits were made outside the owned export file and this required report.
