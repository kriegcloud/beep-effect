## Changes made
- Replaced generic runtime inspection/probe examples with executable `Option.flatMap` demonstrations in `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Option/exports/flatMap.const.ts`.
- Added a source-aligned nested lookup example (`user.address.pipe(O.flatMap(...))`) showing `Some` and `None` propagation.
- Added a second example comparing data-first and data-last invocation forms with deterministic parsing/even-label behavior.
- Removed stale probe-related imports and module-record scaffolding; switched to `formatUnknown` and `import * as O from "effect/Option"`.

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Option/exports/flatMap.const.ts`
- Outcome: Passed (exit code `0`). Both examples completed and logged expected `Option` results.

## Notes / residual risks
- Example output formatting depends on runtime `formatUnknown` JSON rendering, but semantic behavior is deterministic.
