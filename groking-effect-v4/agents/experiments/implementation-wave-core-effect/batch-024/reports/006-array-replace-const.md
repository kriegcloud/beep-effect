## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/replace.const.ts` to replace probe-only content with executable `Array.replace` examples.
- Switched `effect/Array` import to the required alias form: `import * as A from "effect/Array"`.
- Removed unused `probeNamedExportFunction` import and added `formatUnknown` for concise result logging.
- Kept runtime inspection and added two behavior-focused invocation examples:
  - Source-aligned call form (`A.replace(self, index, value)`) including in-range and out-of-bounds/negative index behavior.
  - Curried data-last form (`A.replace(index, value)(iterable)`) including iterable input and short-input behavior.

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/replace.const.ts`
- Outcome: Success (exit code 0). Examples executed and confirmed:
  - valid replacement returns a new array
  - out-of-bounds and negative indices return `undefined`
  - curried iterable usage works as expected

## Notes / residual risks
- No additional risks found for this file-level change.
