## Changes made

- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/reduceRight.const.ts` to replace the zero-arg callable probe with executable, semantically aligned `Array.reduceRight` examples.
- Switched `effect/Array` import style to `import * as A from "effect/Array"` and removed the now-unused `probeNamedExportFunction` import.
- Added two behavior-focused examples:
  - Source JSDoc-aligned data-first fold: `Array.reduceRight([1, 2, 3], 0, (acc, n) => acc + n)`.
  - Curried/data-last fold that logs right-to-left traversal order and callback indexes.

## Verification command + outcome

- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/reduceRight.const.ts`
- Outcome: Success (exit code `0`). All three examples completed and logged expected right-to-left behavior.

## Notes / residual risks

- The examples are deterministic and align with current `effect/Array.reduceRight` semantics (dual data-first/data-last API).
- No additional residual risks identified for this scoped file change.
