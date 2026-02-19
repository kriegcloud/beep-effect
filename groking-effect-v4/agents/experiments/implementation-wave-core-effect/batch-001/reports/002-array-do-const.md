## Changes made
- Replaced the generic probe-oriented example blocks in `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/Do.const.ts` with executable `Array.Do` behaviors.
- Added a seed-scope example that inspects `Array.Do` and confirms it starts with a single empty record.
- Added a source-aligned comprehension example that reproduces the documented `bind` + `filter` + `map` flow and logs the resulting pairs.
- Added a dependent-binding example using `Array.bind` and `Array.let` to derive totals and filter high-value combinations.

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/Do.const.ts`
- Outcome: Success (exit code 0). All examples completed and logged expected deterministic outputs.

## Notes / residual risks
- The file still imports `probeNamedExportFunction` to preserve the existing import contract, but the runtime examples no longer rely on callable probing for `Array.Do`.
