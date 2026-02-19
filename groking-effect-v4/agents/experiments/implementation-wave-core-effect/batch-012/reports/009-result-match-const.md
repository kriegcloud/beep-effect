## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Result/exports/match.const.ts` to replace the zero-arg callable probe with executable `Result.match` examples aligned to the export semantics.
- Kept the runtime inspection example and preserved the existing top-level program shell/structure.
- Added a source-aligned curried formatter example (`Result.match({ onSuccess, onFailure })`).
- Added a data-first one-off fold example (`Result.match(result, handlers)`).
- Removed the now-unused `probeNamedExportFunction` import.

## Verification command + outcome
- Command:
  - `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Result/exports/match.const.ts`
- Outcome:
  - Failed in this environment before running the examples: `Cannot find module '@effect/platform-bun/BunContext' from '/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/runtime/Playground.ts'`.

## Notes / residual risks
- Verification is currently blocked by the missing Bun runtime dependency in the local environment, so runtime behavior of the updated examples could not be executed end-to-end here.
