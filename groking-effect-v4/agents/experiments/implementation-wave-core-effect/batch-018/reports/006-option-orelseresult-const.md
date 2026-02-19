## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Option/exports/orElseResult.const.ts` to replace the generic zero-arg callable probe with source-aligned executable examples.
- Kept runtime inspection and added two behavior-focused examples:
  - `Some("primary")` path showing `Result.Failure` wrapping the primary value.
  - `None` path showing fallback evaluation and `Result.Success` wrapping fallback value.
- Removed stale `probeNamedExportFunction` import and added `formatUnknown` for concise deterministic output formatting.
- Switched `effect/Option` import alias to `O` and updated usage accordingly.

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Option/exports/orElseResult.const.ts`
- Outcome: Passed (exit code `0`). All three examples completed successfully.

## Notes / residual risks
- Runtime output confirms `Result` uses fields `failure` for `Failure` and `value` for `Success`, which differs from the older inline JSDoc snippet wording (`value` for both).
- No cross-file changes were made beyond this export implementation and this required report.
