## Changes made
- Replaced probe-only invocation in `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/isOutOfBounds.function.ts` with executable, semantically aligned `A.isOutOfBounds(index, array)` examples.
- Switched `effect/Array` import alias to `A` to match required alias style.
- Removed unused `probeNamedExportFunction` import after replacing the zero-arg probe example.
- Added two concrete behavior examples:
  - In-range vs out-of-range checks on a non-empty array.
  - Boundary checks for empty array and negative index.

## Verification command + outcome
- Command:
  - `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/isOutOfBounds.function.ts`
- Outcome:
  - Exit code `0`.
  - All three examples completed successfully.
  - Logged behavior matched implementation semantics (`i < 0 || i >= as.length`).

## Notes / residual risks
- `isOutOfBounds` has no source JSDoc summary/example in this generated surface, so examples are derived from runtime/source semantics rather than inline docs.
