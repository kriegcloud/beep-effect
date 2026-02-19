## Changes made
- Replaced the generic zero-arg callable probe example with executable, source-aligned `Result.filterOrFail` demonstrations.
- Kept the runtime inspection example and added a `summarizeResult` helper for concise behavior-focused output.
- Added a filtering example that shows both success pass-through and predicate-triggered failure with `orFailWith`.
- Added a failure pass-through example proving existing `Failure` values are preserved and predicate logic is skipped (`predicateRuns: 0`).
- Removed the now-unused `probeNamedExportFunction` import and added `formatUnknown` for stable result formatting.

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Result/exports/filterOrFail.const.ts`
- Outcome: Passed (exit code 0). All three examples completed successfully.

## Notes / residual risks
- The examples validate runtime behavior for predicate pass/fail and existing failure short-circuiting, but do not demonstrate refinement-specific type narrowing (compile-time only concern).
