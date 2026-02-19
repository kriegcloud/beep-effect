## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/fromIterable.const.ts` only.
- Replaced the generic zero-arg callable probe with executable, semantically aligned examples for `Array.fromIterable`.
- Kept runtime inspection, added a source-aligned `Set` conversion example, and added a deterministic generator-consumption example.
- Removed the now-unused `probeNamedExportFunction` import and switched `effect/Array` import alias to `A` per prompt style.

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/fromIterable.const.ts`
- Outcome: Passed (exit code 0). All three examples completed successfully.

## Notes / residual risks
- Runtime preview shows `fromIterable` may return the original value for array inputs (`Array.isArray(collection) ? collection : Array.from(collection)`), so callers should not assume a copied array when input is already an array.
