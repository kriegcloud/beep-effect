## Changes made
- Replaced generic callable probe logic in `sortWith.const.ts` with executable `sortWith` examples aligned to the export semantics.
- Updated imports to remove `probeNamedExportFunction`, add `formatUnknown`, and use `import * as A from "effect/Array"` plus `import * as Order from "effect/Order"`.
- Kept runtime inspection, and added concrete behavior examples:
  - Source-aligned three-argument invocation.
  - Curried data-last invocation.
  - Non-mutating behavior demonstration.
- Preserved the existing top-level playground structure and `BunRuntime.runMain(program)` shell.

## Verification command + outcome
- Command:
  - `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/sortWith.const.ts`
- Outcome:
  - Exit code `0`.
  - Program ran successfully and all four examples completed.

## Notes / residual risks
- Output ordering for equal derived keys depends on JavaScript sort stability semantics; current examples use distinct key values in behavior-focused checks to keep results deterministic.
