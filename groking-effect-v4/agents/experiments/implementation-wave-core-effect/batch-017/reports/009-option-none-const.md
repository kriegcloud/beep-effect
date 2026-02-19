## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Option/exports/none.const.ts` to replace the generic callable probe with executable, semantics-focused examples for `Option.none`.
- Switched `effect/Option` import alias to `O` and removed unused probe helper import.
- Added behavior examples that:
  - run the source-aligned `O.none<number>()` invocation and verify `O.isNone(...)`.
  - demonstrate None branch behavior via `O.getOrElse` and `O.toArray`, plus singleton identity with `Object.is`.

## Verification command + outcome
- Command:
  - `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Option/exports/none.const.ts`
- Outcome:
  - Passed (exit code `0`).
  - All three examples completed successfully.

## Notes / residual risks
- Behavior is runtime-validated and deterministic for current `effect/Option` semantics.
- Residual risk is limited to upstream library behavior changes (for example, if `none()` ceases to return a shared instance in a future version).
