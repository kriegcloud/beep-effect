## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Option/exports/composeK.const.ts` to replace generic probe-only examples with executable `Option.composeK` examples.
- Kept the existing program shell and section structure intact.
- Preserved a runtime inspection example and added two semantic examples:
  - Source-aligned uncurried composition (`parse` then `doublePositive`).
  - Curried composition with explicit short-circuit verification (second function call count).
- Removed stale probe helper usage/import (`probeNamedExportFunction`) and switched `effect/Option` import alias to `O` per alias guidance.

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Option/exports/composeK.const.ts`
- Outcome: Passed (exit code 0). All examples completed successfully and logs confirmed expected `Some`/`None` behavior for both uncurried and curried usage.

## Notes / residual risks
- Example outputs rely on current runtime object formatting from `formatUnknown`; shape is stable but exact whitespace formatting could vary if runtime formatter changes.
- No cross-file changes were made.
