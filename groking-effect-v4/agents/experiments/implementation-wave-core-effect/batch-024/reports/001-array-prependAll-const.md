## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/prependAll.const.ts` to replace probe-only behavior with executable `Array.prependAll` examples.
- Switched `effect/Array` import alias to `A` per task alias style guidance.
- Removed unused callable probe helper import and callable probe example.
- Added two semantically aligned behavior examples:
  - Source-aligned two-argument invocation (`prependAll([2, 3], [0, 1])`).
  - Curried/data-last invocation using a `Set` iterable.
- Kept runtime inspection example and overall program shell intact.

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/prependAll.const.ts`
- Outcome: Passed (exit code `0`).
- Observed behavior includes:
  - `prependAll([2, 3], [0, 1]) => [0,1,2,3]`
  - `prependAll(["--verbose", "--dry-run"])(Set("build", "watch")) => ["--verbose","--dry-run","build","watch"]`

## Notes / residual risks
- Runtime inspection output includes module export count and function preview; this value may vary if upstream module exports change.
- Example behavior itself is deterministic and aligned with the documented contract.
