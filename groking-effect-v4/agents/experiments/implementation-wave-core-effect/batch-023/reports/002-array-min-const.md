## Changes made
- Replaced probe-only examples in `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/min.const.ts` with executable, semantically aligned `Array.min` demonstrations.
- Updated imports to remove stale runtime probe helpers and use alias-style `import * as A from "effect/Array"`.
- Added three concise examples:
  - Runtime shape/contract inspection for `Array.min`.
  - Source-aligned invocation: `Array.min([3, 1, 2], Order.Number)`.
  - Data-last usage with `pipe` + `Order.mapInput` (minimum by string length), including tie behavior.

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/min.const.ts`
- Outcome: Passed (exit code `0`). All examples completed successfully and produced expected output.

## Notes / residual risks
- `Array.min` requires a non-empty array by contract; this is enforced at type level. Runtime misuse via unsafe casts is still possible but not demonstrated here.
