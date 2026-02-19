## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/splitAt.const.ts` to replace runtime inspection/probe-only examples with executable `splitAt` usage examples.
- Switched the `effect/Array` import to alias style (`import * as A from "effect/Array"`) and removed stale probe/inspection helper imports and values.
- Added two behavior-focused examples:
  - Source-aligned split (`A.splitAt([1, 2, 3, 4, 5], 3)`) with segment-size logging.
  - Curried iterable + boundary behavior (`A.splitAt(2)(Set(...))`, split at `0`, split beyond input length).

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/splitAt.const.ts`
- Outcome: Passed (exit code `0`). Both examples completed successfully.

## Notes / residual risks
- The generated file header references `.repos/effect-smol/...`, which is not present in this workspace, but runtime verification passed against the installed `effect/Array` module.
