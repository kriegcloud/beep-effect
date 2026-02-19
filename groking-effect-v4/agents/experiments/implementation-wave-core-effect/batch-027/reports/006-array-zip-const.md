# 006-array-zip-const

## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/zip.const.ts` to replace generic callable probing with executable `Array.zip` examples.
- Switched module import to alias style `import * as A from "effect/Array"` and removed now-unused probe helper import.
- Added two behavior-focused examples:
  - Source-aligned invocation with positional zipping.
  - Dual (curried) invocation plus truncation behavior when input lengths differ.

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/zip.const.ts`
- Outcome: Passed (exit code `0`). All three examples completed successfully.

## Notes / residual risks
- The runtime inspection example still depends on the shared playground formatter output shape, but the behavior examples directly exercise `zip` semantics and verified expected truncation.
