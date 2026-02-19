## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Result/exports/try.const.ts` to replace generic probe-only behavior with executable, source-aligned `Result.try` examples.
- Added a concrete summary formatter for `Result` outputs.
- Added a source-aligned JSON parsing example covering both overloads:
  - `Result.try(() => ...)`
  - `Result.try({ try, catch })`
- Added a behavior example showing catch-mapper execution only on thrown errors.
- Removed the stale `probeNamedExportFunction` import and kept program shell/top-level structure intact.

## Verification command + outcome
- Command:
  - `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Result/exports/try.const.ts`
- Outcome:
  - Exit code `0` (success)
  - All examples completed successfully.

## Notes / residual risks
- Runtime inspection preview text can vary slightly across upstream library formatting, but behavior-focused examples are deterministic.
