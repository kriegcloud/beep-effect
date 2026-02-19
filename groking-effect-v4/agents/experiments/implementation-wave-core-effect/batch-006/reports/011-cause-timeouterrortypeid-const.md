## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Cause/exports/TimeoutErrorTypeId.const.ts` to replace generic runtime inspection/probe examples with two executable, semantics-aligned examples for `Cause.TimeoutErrorTypeId`.
- Added `readBrandValue` and `hasOwnBrand` helpers to demonstrate brand-key access and discrimination behavior.
- Switched runtime helper imports from `inspectNamedExport`/`probeNamedExportFunction` to `formatUnknown` and removed the now-unused `moduleRecord` value.
- Implemented examples:
  - `Branded Error Shape`: constructs `TimeoutError` and reads its branded field.
  - `Brand Discrimination`: compares brand presence and `Cause.isTimeoutError` across Timeout, NoSuchElement, and generic Error values.

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Cause/exports/TimeoutErrorTypeId.const.ts`
- Outcome: Success (exit code `0`). Both examples completed and logged expected brand/guard behavior.

## Notes / residual risks
- Behavior is aligned with current `effect/Cause` runtime branding and guard implementations; if upstream branding semantics change, example outputs may differ.
