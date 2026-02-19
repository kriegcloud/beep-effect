## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Result/exports/map.const.ts` to replace the generic callable probe with executable, behavior-focused `Result.map` examples.
- Kept the existing program shell and export metadata structure.
- Removed unused `probeNamedExportFunction` import and added `formatUnknown` to produce concise result summaries.
- Added concrete examples for:
  - Source-aligned mapping of `Success` values while preserving `Failure`.
  - Data-first invocation with mapper call-count evidence showing mapper skip on `Failure`.

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Result/exports/map.const.ts`
- Outcome: Passed (exit code `0`). All three examples completed successfully.

## Notes / residual risks
- The implementation now demonstrates curried and data-first forms at runtime; no residual functional issues were observed in this file during the required run.
