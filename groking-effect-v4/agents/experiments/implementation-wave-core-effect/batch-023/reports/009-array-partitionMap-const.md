## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/partitionMap.const.ts` to replace probe-only behavior with executable `partitionMap` examples.
- Switched `effect/Array` import alias to `A` and added `effect/Result` import for source-aligned calls.
- Removed unused `probeNamedExportFunction` import and callable probe example.
- Added two semantic examples:
  - Data-first invocation mirroring the JSDoc parity example.
  - Curried/data-last invocation using callback index to partition strings.

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/partitionMap.const.ts`
- Outcome: Passed (exit code `0`), all three examples completed successfully.

## Notes / residual risks
- Runtime inspection remains as a generic first example by design; behavior-focused coverage is provided by the two executable `partitionMap` examples.
- No additional lint/typecheck suite was run beyond the required command.
