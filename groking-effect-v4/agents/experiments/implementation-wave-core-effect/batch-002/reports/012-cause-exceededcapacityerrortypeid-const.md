## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Cause/exports/ExceededCapacityErrorTypeId.const.ts` to replace generic runtime/probe examples with two semantic, executable examples focused on `ExceededCapacityErrorTypeId`:
  - Created an `ExceededCapacityError` and read the branded property using the type-id key.
  - Compared brand-key presence and `isExceededCapacityError` results across `ExceededCapacityError`, `TimeoutError`, and native `Error`.
- Removed stale helper imports (`inspectNamedExport`, `probeNamedExportFunction`) and removed the stale `moduleRecord` value.
- Added minimal local helpers (`readBrandValue`, `hasOwnBrand`) to keep behavior deterministic and concise.

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Cause/exports/ExceededCapacityErrorTypeId.const.ts`
- Outcome: Passed (exit code `0`).
- Key runtime results:
  - `Brand key: ~effect/Cause/ExceededCapacityError`
  - `Has brand (Exceeded/Timeout/Error): true / false / false`
  - `Type guard (Exceeded/Timeout/Error): true / false / false`

## Notes / residual risks
- The examples rely on current `effect/Cause` runtime branding behavior (string-keyed brand field). If upstream branding internals change, output values may differ while examples remain structurally valid.
