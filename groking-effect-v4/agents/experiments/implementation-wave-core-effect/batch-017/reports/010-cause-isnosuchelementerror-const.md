## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Cause/exports/isNoSuchElementError.const.ts` to replace the generic callable zero-arg probe with source-aligned executable predicate examples.
- Kept runtime export inspection, then added documented invocations:
  - `Cause.isNoSuchElementError(new Cause.NoSuchElementError())` -> `true`
  - `Cause.isNoSuchElementError("nope")` -> `false`
- Added a second behavior example that discriminates `NoSuchElementError` from `TimeoutError` and `Error`.
- Removed the stale `probeNamedExportFunction` import.

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Cause/exports/isNoSuchElementError.const.ts`
- Outcome: Passed (exit code 0).
- Observed behavior:
  - Example 1 logged runtime function shape and source-aligned true/false predicate results.
  - Example 2 logged `NoSuch/Timeout/Error: true / false / false`.

## Notes / residual risks
- The examples are deterministic and aligned with the source JSDoc contract for this predicate.
- Runtime preview text may vary slightly across Effect versions, but guard behavior in the examples remains stable.
