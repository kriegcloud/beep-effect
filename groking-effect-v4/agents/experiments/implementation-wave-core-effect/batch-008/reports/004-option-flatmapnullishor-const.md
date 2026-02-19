## Changes made
- Replaced generic runtime inspection/probe examples with executable, semantics-focused `Option.flatMapNullishOr` examples in `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Option/exports/flatMapNullishOr.const.ts`.
- Added a source-aligned nested optional-property lookup example (employee street name) showing `Some` and `None` outcomes.
- Added a dual-arity invocation example covering both data-first and data-last usage where the mapper can return `null`.
- Removed stale reflection/probe helpers and module-record scaffolding; switched to `formatUnknown` and `effect/Option` alias import (`* as O`).

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Option/exports/flatMapNullishOr.const.ts`
- Outcome: Passed (exit code `0`). Both examples executed successfully and logged expected `Some` / `None` behavior.

## Notes / residual risks
- This change is limited to deterministic runtime examples and does not add compile-time type assertions.
- Behavior depends on current `effect/Option` runtime contract for `flatMapNullishOr`; no cross-version compatibility checks were added in this task.
