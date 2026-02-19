## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Option/exports/fromNullOr.const.ts` to replace the generic zero-arg callable probe with executable, source-aligned `fromNullOr` examples.
- Kept the runtime inspection example and added concrete behavior demos for:
  - `fromNullOr(null)` -> `None`
  - `fromNullOr(undefined)` -> `Some(undefined)`
  - `fromNullOr(42)` -> `Some(42)`
  - Mapping behavior that shows `null` short-circuits while `undefined` remains inside `Some`.
- Removed stale probe helper usage/import and switched Option import alias to `O` per style guidance.

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Option/exports/fromNullOr.const.ts`
- Outcome: Passed (exit code 0). All three examples completed successfully.

## Notes / residual risks
- Runtime output showed `effect/Option` export count as 60 in this environment; that count can vary across library versions/builds but does not affect `fromNullOr` behavior.
