## Changes made
- Removed the unused `probeNamedExportFunction` import from:
  - `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Result/exports/Do.const.ts`
- Kept the executable `Result.Do` examples intact (3 examples remain).
- Kept the top-level runtime shell unchanged (`createPlaygroundProgram(...)` + `BunRuntime.runMain(program)`).

## Verification command + outcome
- Command:
  - `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Result/exports/Do.const.ts`
- Outcome:
  - Exit code `0`.
  - All three examples ran successfully and the demo completed for `effect/Result.Do`.

## Notes / residual risks
- This fix removes the known unused import that can trigger TS6133 / Biome `noUnusedImports` for this file.
- I did not run full-repo lint/typecheck in this task, so unrelated files may still have issues.
