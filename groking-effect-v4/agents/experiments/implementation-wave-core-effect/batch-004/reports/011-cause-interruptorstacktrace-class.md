## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Cause/exports/InterruptorStackTrace.class.ts` to replace the constructor probe example with a semantic `ServiceMap` annotation round-trip aligned to `InterruptorStackTrace` usage.
- Removed unused `probeNamedExportConstructor` import.
- Added `effect/ServiceMap` import for safe annotation key round-trip and lookup.
- Kept class discovery example and program shell intact; maintained two executable examples.

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Cause/exports/InterruptorStackTrace.class.ts`
- Outcome: Success (exit code `0`).
- Observed behavior highlights:
  - Example 1 reports runtime class metadata.
  - Example 2 round-trips `InterruptorStackTrace` on an interrupt cause and safely confirms `StackTrace` is absent.

## Notes / residual risks
- The annotation frame is deterministic synthetic data for stable demonstration; real runtime interruption frames can differ in shape/content.
- The example accesses `cause.reasons[0]` with undefined guards; behavior remains safe for the demonstrated single-reason interrupt cause.
