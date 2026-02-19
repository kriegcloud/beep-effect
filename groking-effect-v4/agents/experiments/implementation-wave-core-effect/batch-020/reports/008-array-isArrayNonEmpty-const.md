## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/isArrayNonEmpty.const.ts` to replace the generic callable probe example with executable, source-aligned usage examples for `Array.isArrayNonEmpty`.
- Switched the module import alias to `import * as A from "effect/Array"` and removed the now-unused `probeNamedExportFunction` import.
- Added two behavior-focused examples:
  - Documented empty vs non-empty invocation outcomes.
  - Guard-based head access that demonstrates non-empty narrowing behavior.

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/isArrayNonEmpty.const.ts`
- Outcome: Passed (exit code 0). All three examples completed successfully.

## Notes / residual risks
- Runtime inspection remains intentionally included as a lightweight metadata check alongside executable semantics.
- No additional automated assertions were added beyond the required playground execution.
