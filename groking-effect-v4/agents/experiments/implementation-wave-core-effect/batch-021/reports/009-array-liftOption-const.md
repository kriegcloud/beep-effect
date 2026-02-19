## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/liftOption.const.ts` with executable, behavior-focused examples.
- Preserved runtime inspection and replaced the generic zero-arg callable probe with source-aligned `Array.liftOption` usage.
- Added two deterministic invocation examples: number parsing (`Some` -> singleton array, `None` -> empty array) and multi-argument forwarding.
- Removed stale helper usage/import (`probeNamedExportFunction`) and switched `effect/Array` import to required alias style (`A`); added `effect/Option` alias (`O`) for explicit Option construction.

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/liftOption.const.ts`
- Outcome: Passed (exit code 0). All three examples completed successfully.

## Notes / residual risks
- Examples cover canonical `Some`/`None` mapping and argument forwarding; they do not exhaustively validate all possible user-provided function side effects.
