## Changes made
- Replaced reflective discovery/probe examples in `CauseFailure.function.ts` with executable `Schema.CauseFailure` examples.
- Added a concrete construction example using `Schema.CauseFailure(Schema.String, Schema.Number)` and logged wiring of `error` / `defect` members.
- Added a decode example for all three reason variants using `Cause.makeFailReason`, `Cause.makeDieReason`, and `Cause.makeInterruptReason` with `Schema.decodeUnknownSync`.
- Added a validation-boundary example showing rejection of mismatched payload types via `Schema.decodeUnknownOption` (`None` outcomes).
- Removed stale reflection helpers/imports and introduced only used imports (`formatUnknown`, `Cause`).

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Schema/exports/CauseFailure.function.ts`
- Outcome: Passed (exit code `0`).
- Observed behavior: all three examples completed successfully, including expected `None` results for invalid payloads.

## Notes / residual risks
- `sourceSummary` and `sourceExample` remain unchanged because upstream JSDoc did not provide inline content.
- The examples validate runtime behavior for `String`/`Number` specializations; other schema combinations are not exercised in this file.
