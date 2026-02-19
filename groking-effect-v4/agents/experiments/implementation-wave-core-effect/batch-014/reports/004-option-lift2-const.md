## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Option/exports/lift2.const.ts` to replace zero-arg probe behavior with executable, source-aligned `Option.lift2` examples.
- Kept runtime export inspection and added two semantic examples:
  - `some + some` vs `some + none` result propagation.
  - Combiner call guard showing the lifted combiner runs only when both inputs are `Some`.
- Removed stale helper import (`probeNamedExportFunction`) and added `formatUnknown` for concise output formatting.
- Switched Option import alias to `O` per alias guidance.

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Option/exports/lift2.const.ts`
- Outcome: Success (exit code 0). All examples completed.

## Notes / residual risks
- Runtime preview strings (e.g., function source snippet) may vary slightly across Effect/Bun versions, but behavioral outcomes for the included examples are deterministic.
