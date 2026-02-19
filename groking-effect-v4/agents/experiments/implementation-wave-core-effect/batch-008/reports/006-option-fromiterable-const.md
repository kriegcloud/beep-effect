## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Option/exports/fromIterable.const.ts` to replace generic callable probing with executable, semantics-aligned examples for `Option.fromIterable`.
- Removed stale `probeNamedExportFunction` usage/import.
- Switched Option import to alias style (`import * as O from "effect/Option"`) and updated module record/reference usage accordingly.
- Added a reusable `formatOption` helper for concise behavior-focused logging.
- Added two concrete behavior examples beyond runtime inspection:
  - Source-aligned non-empty vs empty iterable behavior.
  - Lazy iterable short-consumption behavior (only first yielded element consumed).

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Option/exports/fromIterable.const.ts`
- Outcome: Passed (exit code `0`).
- Observed key outputs:
  - `fromIterable([1, 2, 3]) => Some(1)`
  - `fromIterable([]) => None`
  - Lazy iterable markers: `yield-10` (confirming first-element-only consumption)

## Notes / residual risks
- Example behavior matches the current Effect implementation contract in runtime output and documented JSDoc intent.
- No known residual functional risk within this file; broader API changes upstream could alter preview text formatting but not core example logic.
