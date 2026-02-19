## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Result/exports/tap.const.ts` to replace the generic callable probe with executable, semantics-focused `Result.tap` examples.
- Kept the existing playground shell and runtime inspection block, and added source-aligned behavior demos that show:
  - Side-effects run for `Success`.
  - `tap` returns the original `Result` reference unchanged.
  - `Failure` bypasses side-effects.
  - Data-first invocation behaves consistently with data-last usage.
- Removed stale probe helper usage/import and added only the formatting helper needed for concise result summaries.

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Result/exports/tap.const.ts`
- Outcome: Success (exit code 0). All examples completed, including source-aligned success behavior and failure short-circuit checks.

## Notes / residual risks
- Examples rely on current `effect/Result` overloads supporting both data-last and data-first invocation for `tap`; if upstream signatures change, this playground may need adjustment.
