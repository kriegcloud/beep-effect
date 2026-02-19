## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Option/exports/getOrThrowWith.const.ts` to replace the generic zero-arg callable probe with executable, source-aligned examples.
- Kept runtime inspection and added behavior-focused examples for:
  - documented data-first invocation (`getOrThrowWith(option, onNone)`) over `Some` and `None`
  - curried invocation (`getOrThrowWith(onNone)(option)`) showing lazy error-thunk execution
- Removed stale helper usage/imports tied to probe-only behavior and switched `effect/Option` import to `import * as O from "effect/Option"` per alias guidance.

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Option/exports/getOrThrowWith.const.ts`
- Outcome: Passed (exit code 0). All three examples completed, including expected custom-error throws for `None`.

## Notes / residual risks
- Behavior is aligned with current runtime contract (supports both data-first and curried forms).
- Residual risk is low and limited to future upstream contract/signature changes for `Option.getOrThrowWith`.
