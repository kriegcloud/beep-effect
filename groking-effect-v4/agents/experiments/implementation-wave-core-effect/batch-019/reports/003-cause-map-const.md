## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Cause/exports/map.const.ts` only.
- Removed the generic zero-argument callable probe and its stale helper import (`probeNamedExportFunction`).
- Kept runtime export inspection and added executable, semantically aligned `Cause.map` examples:
  - Source-aligned mapping of `Cause.fail("error")` to uppercase, logging original vs mapped fail values.
  - No-fail pass-through behavior using `Die` + `Interrupt` reasons, showing reference preservation and unchanged reason tags.

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Cause/exports/map.const.ts`
- Outcome: Passed (exit code 0). All 3 examples completed successfully.

## Notes / residual risks
- The runtime preview line for the exported function body is environment/runtime formatting-dependent, but the semantic logs for mapping and pass-through behavior are deterministic.
