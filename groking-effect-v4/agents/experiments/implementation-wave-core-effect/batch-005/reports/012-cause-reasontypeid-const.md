## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Cause/exports/ReasonTypeId.const.ts` to replace generic runtime inspection/callable probing with executable, semantics-aligned examples for `ReasonTypeId`.
- Removed stale probe helpers/import usage and added focused brand helpers:
  - `readBrandValue` for reading a branded field from unknown values
  - `hasOwnBrand` for deterministic own-property brand checks
- Added two behavior-focused examples:
  - `Reason Brand Round-Trip`: constructs `Fail`, `Die`, and `Interrupt` reasons and verifies each carries `CauseModule.ReasonTypeId`
  - `Brand vs Runtime Guard`: compares raw brand-key presence with `CauseModule.isReason` across a real reason, a `Cause`, and a lookalike object

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Cause/exports/ReasonTypeId.const.ts`
- Outcome: success (exit code 0). Both examples completed and logged expected runtime behavior.

## Notes / residual risks
- The examples reflect current `effect/Cause` runtime guard behavior; notably, `isReason` accepted a lookalike object carrying the brand key, even with a non-canonical brand value. If upstream guard semantics tighten, this demonstration output will change.
