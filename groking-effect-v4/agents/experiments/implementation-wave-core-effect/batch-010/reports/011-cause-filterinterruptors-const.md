## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Cause/exports/filterInterruptors.const.ts` only.
- Replaced generic runtime inspection/probe examples with executable, behavior-focused examples:
  - Source-aligned success case: `Cause.filterInterruptors(Cause.interrupt(1))` logs extracted interruptor IDs.
  - No-interrupt case: `Cause.filterInterruptors(Cause.fail("boom"))` logs `Filter.fail` behavior.
- Removed stale reflection/probe helpers and the unused `moduleRecord` value.
- Added `effect/Result` import to branch on success vs failure explicitly.

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Cause/exports/filterInterruptors.const.ts`
- Outcome: Passed (exit code `0`), both examples completed successfully.

## Notes / residual risks
- The failure-path example validates behavior via `Cause.hasInterrupts(result.failure) === false`; it does not assert reference identity with the original cause object.
