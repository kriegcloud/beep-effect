## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Cause/exports/pretty.const.ts` to replace the generic zero-arg callable probe with executable, source-aligned `Cause.pretty` examples.
- Kept the runtime inspection example, then added behavior-focused examples for:
  - Rendering a single fail cause (`Cause.fail("something went wrong")`).
  - Rendering a combined fail + die cause and checking both messages are present.
  - Rendering an interrupt-only cause and confirming interrupt-focused output.
- Removed the stale `probeNamedExportFunction` import.

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Cause/exports/pretty.const.ts`
- Outcome: Passed (exit code `0`).
- Observed key outputs:
  - `first line: Error: something went wrong`
  - `prettyErrors count: 2`
  - `includes typed failure: true`
  - `includes defect message: true`
  - `first line: InterruptError: All fibers interrupted without error {`
  - `mentions interrupt id: true`

## Notes / residual risks
- Rendered stack trace bodies are runtime-dependent (paths/line numbers can vary); the examples deliberately verify stable message fragments and counts instead of exact full-stack text.
- No cross-file source edits were made outside the owned export file and this required report.
