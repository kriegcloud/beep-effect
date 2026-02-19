## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/appendAll.const.ts` to replace generic runtime inspection/probe examples with executable `appendAll` behavior examples.
- Switched the `effect/Array` import to the required alias style: `import * as A from "effect/Array"`.
- Added two semantics-focused examples:
  - `Source-Aligned Concatenation`: runs `A.appendAll([1, 2], [3, 4])` and logs result plus input immutability.
  - `Curried Iterable Concatenation`: demonstrates curried `A.appendAll(...)` with a `Set` input and logs the combined order/length.
- Removed stale helper imports and values (`inspectNamedExport`, `probeNamedExportFunction`, and `moduleRecord`) that became unused.

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/appendAll.const.ts`
- Outcome: Passed (exit code `0`). Both examples completed successfully and the demo finished for `effect/Array.appendAll`.

## Notes / residual risks
- Examples demonstrate runtime behavior and ordering for arrays/iterables, but they do not assert compile-time return-type refinements (for example, `NonEmptyArray` overload narrowing).
