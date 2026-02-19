## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Option/exports/fromUndefinedOr.const.ts` to replace generic runtime inspection/probe examples with executable, source-aligned behavior examples.
- Added a focused formatter for `Option` outputs and implemented two semantic demos:
  - `Undefined vs Null Conversion` (undefined -> None, null/value -> Some)
  - `Optional Field Normalization` (practical optional-field handling preserving explicit `null`)
- Removed stale helper usage/imports related to generic probes.

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Option/exports/fromUndefinedOr.const.ts`
- Outcome: Passed (exit code 0). Both examples completed successfully.

## Notes / residual risks
- The examples validate runtime behavior for representative inputs (`undefined`, `null`, and concrete values) but do not exhaustively cover all possible value types.
