## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Option/exports/filter.const.ts` to replace generic runtime inspection/probe examples with executable `Option.filter` behavior examples.
- Switched `effect/Option` import alias to `O` per alias guidance.
- Removed stale probe helper imports and the unused `moduleRecord` binding.
- Added two deterministic examples:
  - Source-aligned filtering (`some("hello")`, `some("")`, `none()`).
  - Curried/data-last predicate reuse for even-number filtering.

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Option/exports/filter.const.ts`
- Outcome: Success (exit code `0`). Both examples completed and logged expected `Some`/`None` behavior.

## Notes / residual risks
- The examples validate core runtime behavior for predicate pass/fail and `None` passthrough.
- Type-level refinement behavior is not explicitly demonstrated in runtime output (compile-time concern).
