## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Option/exports/getOrNull.const.ts` only.
- Replaced the generic zero-arg callable probe with source-aligned executable examples:
  - `O.getOrNull(O.some(1))` -> `1`
  - `O.getOrNull(O.none<number>())` -> `null`
- Kept runtime inspection as one example and retained the existing program shell.
- Removed stale helper usage/import (`probeNamedExportFunction`) and switched Option import alias to `O`.

## Verification command + outcome
- Command:
  - `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Option/exports/getOrNull.const.ts`
- Outcome:
  - Exit code `0` (success)
  - All three examples completed, with behavior logs showing `Result: 1` for `Some(1)` and `Result: null` for `None`.

## Notes / residual risks
- Examples are deterministic and aligned with the source JSDoc behavior.
- Residual risk is low; this file depends on shared playground/runtime helpers remaining stable.
