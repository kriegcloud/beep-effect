## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/dedupeAdjacentWith.const.ts` to replace probe-only behavior with executable, semantics-focused examples.
- Kept the runtime inspection example and replaced the callable zero-arg probe with:
  - A source-aligned invocation using `A.dedupeAdjacentWith([1,1,2,2,3,3], (a, b) => a === b)`.
  - A curried custom-equivalence invocation deduping adjacent objects by `id`.
- Removed unused helper import `probeNamedExportFunction` and switched `effect/Array` import alias to `A` per alias style guidance.

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/dedupeAdjacentWith.const.ts`
- Outcome: Passed (exit code `0`).
- Observed behavior:
  - Source-aligned example produced `[1,2,3]`.
  - Curried object example produced `["1:Alice","2:Bob","1:Alice reintroduced"]`.

## Notes / residual risks
- Example behavior is deterministic and aligned with the export contract (adjacent-only deduplication).
- No additional residual risks identified from this single-file implementation.
