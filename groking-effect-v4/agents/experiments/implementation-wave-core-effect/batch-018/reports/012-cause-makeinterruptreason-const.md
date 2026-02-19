## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Cause/exports/makeInterruptReason.const.ts` only.
- Removed the generic callable probe example and its stale helper import (`probeNamedExportFunction`).
- Kept runtime export inspection and added two executable, source-aligned examples:
  - Construct `Cause.makeInterruptReason(42)` and log `_tag`, `fiberId`, and `Cause.isInterruptReason(...)`.
  - Use the produced reason with `Cause.fromReasons(...)`, verify `hasInterruptsOnly`, and show omitted `fiberId` behavior.

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Cause/exports/makeInterruptReason.const.ts`
- Outcome: Passed (exit code 0). All 3 examples completed successfully.

## Notes / residual risks
- The runtime preview string for function bodies can vary slightly by upstream runtime formatting, but semantic behavior and logged outputs are deterministic.
