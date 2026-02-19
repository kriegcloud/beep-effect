## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Cause/exports/prettyErrors.const.ts` to replace probe-only behavior with semantically aligned, executable examples.
- Removed the stale `probeNamedExportFunction` helper import and replaced the callable probe block.
- Added concrete examples covering:
  - Source-aligned fail case: `Cause.fail(new Error("boom"))`.
  - Mixed fail/die/interrupt cause showing fail+die become two `Error`s.
  - Interrupt-only fallback showing single `InterruptError` and interrupt IDs in cause stack.
- Kept the existing file scaffold (`Export Coordinates`, `Example Blocks`, `Program`) and runtime shell (`BunRuntime.runMain(program)`).

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Cause/exports/prettyErrors.const.ts`
- Outcome: Passed (exit code `0`).
- Observed behavior highlights:
  - Source-aligned example produced one error: `Error: boom`.
  - Mixed example produced two messages: `typed failure | defect boom`.
  - Interrupt-only example produced one `InterruptError` and confirmed both `#3` and `#9` in interrupt metadata.

## Notes / residual risks
- Runtime inspection output includes function-source preview text that may vary slightly between runtime/build variants, but behavior-focused examples are deterministic.
