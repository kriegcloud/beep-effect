## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Result/exports/liftPredicate.const.ts` to replace generic callable probing with executable, semantics-focused examples.
- Kept runtime inspection and added `summarizeResult` for concise `Success(...)` / `Failure(...)` output.
- Added a source-aligned data-last example using `Result.liftPredicate(predicate, orFailWith)` and showing both passing and failing inputs.
- Added a data-first example using `Result.liftPredicate(value, predicate, orFailWith)` and confirmed `orFailWith` is invoked only on predicate failure.
- Removed stale probe helper import usage.

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Result/exports/liftPredicate.const.ts`
- Outcome: Passed (exit code `0`). All examples completed successfully.

## Notes / residual risks
- Examples are deterministic and aligned with documented overload behavior (data-last and data-first usage).
- Residual risk is low; this run validates runtime behavior but does not add separate type-level assertions for refinement narrowing.
