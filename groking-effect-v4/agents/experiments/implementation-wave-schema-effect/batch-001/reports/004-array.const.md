## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Schema/exports/Array.const.ts` to replace reflection/probe examples with executable `Schema.Array` usage examples.
- Added Example 1 showing `Schema.Array(Schema.Number)` with `decodeUnknownSync` and `is` checks for valid vs mixed input.
- Added Example 2 showing element-level constraint propagation with `Schema.Array(Schema.NonEmptyString)`, including success and handled rejection output.
- Removed stale probe-only utilities/import usage and removed the unused `moduleRecord` value.

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Schema/exports/Array.const.ts`
- Outcome: Passed (exit code `0`). Both examples completed and produced expected runtime logs.

## Notes / residual risks
- `sourceSummary` / `sourceExample` remain unchanged because no JSDoc summary/example was present in the generated scaffold.
- Logs currently include pretty-printed arrays from `formatUnknown`; output is concise but multi-line for array payloads.
