## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Result/exports/getFailure.const.ts` to replace probe-only behavior with executable, semantics-focused examples.
- Kept runtime export inspection, then added source-aligned `Result.getFailure(Result.succeed(...))` and `Result.getFailure(Result.fail(...))` invocation output.
- Added a failure-only branching example using `Option.match` to demonstrate practical handling when only error information matters.
- Removed the stale `probeNamedExportFunction` usage/import and added only required imports (`formatUnknown`, `effect/Option` alias `O`).

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Result/exports/getFailure.const.ts`
- Outcome: Passed (exit code `0`). All three examples completed successfully and produced expected `Option`-based behavior.

## Notes / residual risks
- The output includes the runtime Option representation (with `_id` / `_tag` fields), which is stable for current `effect` runtime formatting but may differ slightly across library versions.
