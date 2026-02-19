## Changes made
- Replaced reflection-only examples in `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Schema/exports/CauseIso.type.ts` with executable runtime companion flows using `Schema.Cause(...)` and `Schema.toCodecIso(...)`.
- Added a decode example that turns an iso-shaped array of failures into a runtime `Cause` value.
- Added a round-trip example that encodes a decoded `Cause` back to iso form and shows validation failure output for an invalid iso payload.
- Removed stale reflective helper imports and the unused `moduleRecord` value.

## Verification command + outcome
- Command:
  - `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Schema/exports/CauseIso.type.ts`
- Outcome:
  - Passed (exit code `0`).
  - Both examples completed successfully and produced expected decode / round-trip / invalid-input failure logs.

## Notes / residual risks
- Runtime behavior is aligned with the current installed `effect` package implementation.
- Upstream type declarations for `CauseFailureIso` appear inconsistent with runtime payload keys in the `Die` case (`error` vs `defect`), so future upstream changes could affect compile-time ergonomics even when runtime examples continue to work.
