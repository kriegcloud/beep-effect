## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Result/exports/isSuccess.const.ts` to replace generic callable probing with executable, source-aligned examples.
- Kept runtime inspection, then added:
  - A JSDoc-aligned narrowing example using `Result.succeed(42)` + `Result.isSuccess(...)` and `.success` payload access.
  - A predicate-filtering example using `samples.filter(Result.isSuccess)` over mixed `Success`/`Failure` values.
- Removed stale helper usage (`probeNamedExportFunction`) and added `formatUnknown` for concise deterministic result summaries.

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Result/exports/isSuccess.const.ts`
- Outcome: Pass (exit code `0`). All three examples completed successfully.

## Notes / residual risks
- No functional/runtime issues observed in this file during the required run.
- Residual risk is limited to upstream API behavior changes in `effect/Result` that could alter preview strings or tags in the future.
