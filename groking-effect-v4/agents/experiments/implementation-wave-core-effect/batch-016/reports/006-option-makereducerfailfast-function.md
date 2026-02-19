## Changes made
- Replaced generic zero-arg probe usage with executable, source-aligned examples for `Option.makeReducerFailFast`.
- Kept the discovery example and added two invocation examples:
  - Source-aligned `combineAll` behavior (`[some(1), some(2)]` vs `[some(1), none]`).
  - Fail-fast position contrast (`None` first vs `None` last).
- Removed stale `probeNamedExportFunction` import and switched `effect/Option` import alias to `O` per alias style guidance.
- Added `effect/Number` import to construct a real reducer (`Number.ReducerSum`).

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Option/exports/makeReducerFailFast.function.ts`
- Outcome: Passed (exit code `0`).
- Key runtime lines:
  - `[some(1), some(2)] => Some(3)`
  - `[some(1), none] => None`
  - `[none, some(2), some(3)] => None`
  - `[some(1), some(2), none] => None`

## Notes / residual risks
- The implementation is aligned to the documented fail-fast semantics and uses deterministic values.
- No additional residual risks identified for this isolated export example update.
