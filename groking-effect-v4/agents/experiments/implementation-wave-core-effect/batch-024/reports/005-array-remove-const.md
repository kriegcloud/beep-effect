## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/remove.const.ts` to replace the generic zero-arg callable probe with executable, source-aligned `remove` examples.
- Switched the Array import alias to `import * as A from "effect/Array"` per alias guidance.
- Kept runtime inspection, and added behavior-focused examples for:
  - documented data-first invocation (`A.remove(input, index)`), including in-range and out-of-bounds outcomes
  - curried data-last invocation (`A.remove(index)(iterable)`), including iterable input (`Set`)
- Removed now-unused helper import (`probeNamedExportFunction`) and added `formatUnknown` for concise deterministic output.

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/remove.const.ts`
- Outcome: Success (exit code 0). All three examples completed, including source-aligned and curried invocations.

## Notes / residual risks
- Examples validate runtime behavior for normal and out-of-bounds positive indices plus curried iterable usage.
- Negative index behavior is not explicitly demonstrated in this file, though the out-of-bounds contract is covered.
