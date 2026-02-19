## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Option/exports/isSome.const.ts` to replace the generic zero-arg callable probe with executable, source-aligned `Option.isSome` examples.
- Switched `effect/Option` import to alias style (`import * as O from "effect/Option"`) and removed stale probe helper import.
- Added behavior-focused examples:
  - JSDoc-aligned `O.isSome(O.some(1))` and `O.isSome(O.none())` checks.
  - Predicate usage to filter a list of `Option` values and extract present payloads.

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Option/exports/isSome.const.ts`
- Outcome: Passed (exit code `0`). All examples completed successfully.

## Notes / residual risks
- Output includes full JSON previews for `Option` values (from shared formatter); this is deterministic but somewhat verbose.
