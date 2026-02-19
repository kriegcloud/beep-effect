## Changes made
- Removed unused imports `inspectNamedExport` and `probeNamedExportFunction` from `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/Array.const.ts`.
- Removed unused value `moduleRecord` from `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/Array.const.ts`.
- Kept both executable examples and preserved the top-level runtime shell (`createPlaygroundProgram` + `BunRuntime.runMain`).

## Verification command + outcome
- Command:
  - `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/Array.const.ts`
- Outcome:
  - Exit code `0`.
  - Program executed successfully and both examples completed.

## Notes / residual risks
- This fix is narrowly scoped to unused symbols in the owned file.
- No additional lint/check commands were run beyond the required `bun run` command.
