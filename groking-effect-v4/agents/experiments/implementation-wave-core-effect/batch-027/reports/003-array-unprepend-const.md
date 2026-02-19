# Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/unprepend.const.ts` to replace the zero-arg callable probe with semantic `Array.unprepend` examples.
- Switched `effect/Array` import to alias style `import * as A from "effect/Array"` and updated module record binding accordingly.
- Kept runtime inspection, added arity logging, and added two executable behavior examples:
  - Source-aligned split/recompose flow for `[1, 2, 3, 4]`.
  - Singleton behavior plus guarded handling for potentially empty input.
- Removed now-unused `probeNamedExportFunction` import.

# Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/unprepend.const.ts`
- Outcome: Success (exit code `0`), all 3 examples completed, demo finished for `effect/Array.unprepend`.

# Notes / residual risks
- Contract safety for uncertain input remains caller-managed; example demonstrates guarding with `A.isReadonlyArrayNonEmpty` before calling `A.unprepend`.
