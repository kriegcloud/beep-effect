## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Result/exports/all.const.ts` while preserving the existing top-level playground structure and runtime shell.
- Replaced generic probe-only behavior with executable, source-aligned `Result.all` examples.
- Kept runtime shape inspection for export context, and added behavior-focused examples for:
  - tuple collection success and first-failure short-circuit
  - struct collection success and first-failure short-circuit
- Removed stale callable probe usage/import (`probeNamedExportFunction`) and added a small result formatter for concise logs.

## Verification command + outcome
- Command:
  - `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Result/exports/all.const.ts`
- Outcome:
  - Exit code `0`.
  - All three playground examples completed successfully.

## Notes / residual risks
- Examples cover tuple and struct forms from source JSDoc and demonstrate failure propagation.
- Iterable-specific `Result.all` behavior is not separately demonstrated in this file.
