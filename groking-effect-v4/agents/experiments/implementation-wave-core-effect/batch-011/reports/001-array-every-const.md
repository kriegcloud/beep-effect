## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/every.const.ts` to replace generic callable probing with executable `Array.every` behavior examples.
- Kept the runtime program shell intact and retained runtime inspection.
- Switched `effect/Array` import alias to `A` and removed stale probe import usage.
- Added two semantic behavior examples:
  - Source-aligned parity checks from JSDoc (`true` and `false` outcomes).
  - Deterministic short-circuit demonstration showing predicate call count.

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/every.const.ts`
- Outcome: Success (exit code `0`). All three examples completed.

## Notes / residual risks
- The short-circuit example assumes `Array.every` preserves standard early-exit semantics; runtime output confirms this behavior in the current version.
