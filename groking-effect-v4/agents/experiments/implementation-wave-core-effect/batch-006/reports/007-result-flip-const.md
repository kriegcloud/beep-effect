## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Result/exports/flip.const.ts` to replace generic runtime inspection/probe examples with executable `Result.flip` behavior examples.
- Removed stale probe helper imports and the unused `moduleRecord` binding.
- Added `formatUnknown` logging for concise runtime output formatting.
- Added two deterministic examples:
  - Source-aligned channel swap for `Result.succeed(42)` and `Result.fail("error")`.
  - Double-flip round-trip behavior showing channel orientation restoration.

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Result/exports/flip.const.ts`
- Outcome: Success (exit code `0`). Both examples completed and showed expected `Success`/`Failure` channel swaps.

## Notes / residual risks
- The examples cover the core runtime behavior of `flip` for both channels and for round-trip usage.
- They do not explicitly cover composition with other `Result` combinators; behavior there is assumed from `flip`’s channel swap contract.
