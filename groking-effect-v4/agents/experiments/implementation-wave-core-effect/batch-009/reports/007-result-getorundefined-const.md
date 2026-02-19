## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Result/exports/getOrUndefined.const.ts` to replace generic callable probing with executable, source-aligned examples.
- Kept runtime inspection and added two behavior-focused examples:
  - Source-aligned `succeed` / `fail` unwrap showing `undefined` on failure.
  - Undefined-interop workflow showing filtering of defined values.
- Removed stale `probeNamedExportFunction` usage/import and added `formatUnknown` for concise value logging.

## Verification command + outcome
- Command:
  - `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Result/exports/getOrUndefined.const.ts`
- Outcome:
  - Exit code `0`.
  - Program completed successfully and all three examples reported `✅ Example completed`.

## Notes / residual risks
- The runtime preview string for function exports is implementation-detail output from the Effect library and may vary across library/runtime versions.
- The interop example intentionally normalizes array logging so `undefined` is visible in output while preserving the actual `undefined` check (`middle value is undefined -> true`).
