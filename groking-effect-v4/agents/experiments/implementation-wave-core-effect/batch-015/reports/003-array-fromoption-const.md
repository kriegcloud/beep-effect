## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/fromOption.const.ts` to replace generic callable probing with executable, semantics-aligned examples for `fromOption`.
- Kept the runtime inspection example and added source-aligned `Some`/`None` conversion output.
- Added a composition example using `flatMap(A.fromOption)` to demonstrate extracting present values from `Array<Option<number>>`.
- Removed stale `probeNamedExportFunction` usage/import and added only needed helpers/imports (`formatUnknown`, `effect/Option` as `O`, `effect/Array` as `A`).

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/fromOption.const.ts`
- Outcome: Passed (exit code `0`). All three examples completed successfully.

## Notes / residual risks
- Output formatting relies on `JSON.stringify` for array display; behavior is deterministic for the values shown.
- Example coverage is focused on runtime conversion semantics (`Some`/`None`) and composition usage; no additional edge-case fuzzing was added.
