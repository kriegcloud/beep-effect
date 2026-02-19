## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Result/exports/Do.const.ts` example blocks from generic inspection/probe behavior to executable `Result.Do` semantics.
- Kept runtime inspection as Example 1.
- Replaced callable probe usage with two source-aligned behaviors:
  - A happy-path do-notation chain using `bind` + `let`.
  - A failure-path chain showing short-circuiting on `Result.fail` plus `getOrElse` fallback.
- Preserved the existing top-level file structure and runtime program shell (`createPlaygroundProgram` + `BunRuntime.runMain`).

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Result/exports/Do.const.ts`
- Outcome: Exit code `0`.
- Result: All three examples completed successfully and logged expected deterministic `Result.Do` behavior.

## Notes / residual risks
- The import list still includes `probeNamedExportFunction` to preserve the existing import contract, but the current examples no longer rely on callable probing.
- Source JSDoc output text references a `success` field, while current runtime output uses `value` for `Success`; examples reflect observed runtime behavior.
