## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Schema/exports/Cause.function.ts` to replace reflection/probe-only examples with executable `Schema.Cause` usage.
- Removed `inspectNamedExport`, `probeNamedExportFunction`, and `moduleRecord` usage.
- Added a constructor-focused example showing required arity and schema construction.
- Added a round-trip example for encoding and decoding fail/defect causes.
- Added a contrast example for valid and invalid payload typing via `decodeUnknownOption`.
- Removed stale helper imports and added only required runtime imports (`formatUnknown`, `effect/Cause`, `effect/Option`).

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Schema/exports/Cause.function.ts`
- Outcome: Success (exit code 0). All three examples completed and the demo finished normally.

## Notes / residual risks
- The examples validate common `Fail` and `Die` payload paths and decoding rejection behavior, but do not cover `Interrupt` reasons explicitly.
