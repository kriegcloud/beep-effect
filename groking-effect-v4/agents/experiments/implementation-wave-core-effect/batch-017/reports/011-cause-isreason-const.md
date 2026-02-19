## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Cause/exports/isReason.const.ts` to replace probe-only behavior with executable, semantically aligned examples.
- Removed stale `probeNamedExportFunction` import.
- Kept runtime inspection, then added:
  - Source-aligned JSDoc invocation (`Cause.fail("error").reasons[0]` vs `"not a reason"`).
  - Mixed-candidate guard checks across real `Reason` variants, a `Cause`, and structural objects.
- Preserved top-level file structure and Bun program shell.

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Cause/exports/isReason.const.ts`
- Outcome: Passed (exit code 0). All three examples completed successfully.

## Notes / residual risks
- Runtime behavior confirms `isReason` is structural (brand-property based), so branded plain objects pass even when not created by constructors.
- No additional residual risks observed for this file-level change.
