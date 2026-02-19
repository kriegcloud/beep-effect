## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/NonEmptyArray.type.ts` to replace reflective-only runtime examples with executable companion API flows while preserving imports, metadata, and program shell.
- Kept the type-erasure example, but added an explicit bridge note clarifying that `NonEmptyArray` is compile-time only and runtime behavior is demonstrated through `effect/Array` APIs.
- Replaced module inspection-only behavior with two concrete, source-aligned examples:
  - `Companion Construction + Mutation`: `Array.make(1, 2, 3)`, mutable `push(4)`, and `Array.append(..., 5)`.
  - `Companion Guard Flow`: inspected `Array.isArrayNonEmpty` runtime export, then used the guard to safely access `head` and mutate the array.

## Verification command + outcome
- Command:
  - `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/NonEmptyArray.type.ts`
- Outcome:
  - Exit code `0`.
  - All three examples completed successfully and logged expected non-empty array behavior.

## Notes / residual risks
- The guard-flow example demonstrates a successful non-empty branch; it does not also log an empty-branch input in the same run.
