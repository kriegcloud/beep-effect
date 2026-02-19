## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/chunksOf.const.ts` to replace generic runtime inspection/probe examples with executable `chunksOf` behavior examples.
- Switched the `effect/Array` import to the required alias style: `import * as A from "effect/Array"`.
- Added two semantics-focused examples:
  - `Source-Aligned Chunking`: runs `A.chunksOf([72, 74, 71, 69, 68], 2)` and logs chunked output plus chunk sizes.
  - `Curried Chunking And Empty Input`: demonstrates `A.chunksOf(3)` with a `Set` input and confirms `chunksOf(3)([])` returns `[]`.
- Removed stale helper imports and values that became unused after the rewrite (`inspectNamedExport`, `probeNamedExportFunction`, and `moduleRecord`).

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/chunksOf.const.ts`
- Outcome: Passed (exit code `0`). Both examples completed successfully and the demo finished for `effect/Array.chunksOf`.

## Notes / residual risks
- Examples cover standard and curried runtime behavior, including the documented empty-input case, but they do not validate compile-time type-level guarantees (for example, `NonEmptyArray` outer/inner narrowing).
