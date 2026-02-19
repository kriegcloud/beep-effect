## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/length.const.ts` only.
- Replaced the generic zero-arg callable probe with executable `Array.length` examples aligned to the source docs.
- Kept runtime inspection and added two behavior-focused examples: the documented invocation and readonly/empty array cases.
- Removed the unused `probeNamedExportFunction` import and switched the `effect/Array` alias to `A` per task alias style.

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/length.const.ts`
- Outcome: Passed (exit code 0). All examples completed successfully.

## Notes / residual risks
- `Array.length` is a direct wrapper over the array `length` property, so behavior is straightforward and deterministic for standard arrays/tuples.
