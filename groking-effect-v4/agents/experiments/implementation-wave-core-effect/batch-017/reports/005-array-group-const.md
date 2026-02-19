## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/group.const.ts` only.
- Replaced generic zero-arg callable probe with executable, source-aligned `Array.group` examples.
- Switched `effect/Array` import to alias style (`import * as A from "effect/Array"`).
- Removed now-unused `probeNamedExportFunction` import.
- Added two behavior-focused invocations:
  - Source JSDoc-aligned grouping example.
  - Adjacent-only grouping behavior example.

## Verification command + outcome
- Command:
  - `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/group.const.ts`
- Outcome:
  - Exit code `0` (success)
  - All three examples completed successfully and logged expected grouping behavior.

## Notes / residual risks
- `group` is typed for `NonEmptyReadonlyArray`; examples intentionally use non-empty literal inputs to stay within documented contract.
