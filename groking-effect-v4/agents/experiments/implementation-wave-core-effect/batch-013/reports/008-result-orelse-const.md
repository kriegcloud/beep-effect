## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Result/exports/orElse.const.ts` to replace zero-arg probe-only behavior with executable, source-aligned `Result.orElse` examples.
- Kept runtime inspection and added a curried/JSDoc-aligned recovery example showing `Failure` fallback and `Success` passthrough.
- Added a data-first `orElse(self, that)` example showing fallback is called only for `Failure`.
- Removed stale playground probe usage and import; added `formatUnknown` + `Result.match`-based result summarization for concise logs.

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Result/exports/orElse.const.ts`
- Outcome: Passed (exit code 0). All three examples completed successfully.

## Notes / residual risks
- The runtime preview of the export function body is implementation-detail output from the library build and may vary across Effect versions, but example behavior remains deterministic.
