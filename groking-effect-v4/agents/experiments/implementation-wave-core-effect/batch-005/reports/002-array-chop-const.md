## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/chop.const.ts` to replace probe-only behavior with executable `Array.chop` examples while preserving the existing top-level program shell.
- Switched the `effect/Array` import to the required alias style: `import * as A from "effect/Array"`.
- Removed stale helper usage (`probeNamedExportFunction`) and added two semantically aligned examples:
  - Source-aligned data-first invocation matching the JSDoc call shape.
  - Curried/data-last invocation that consumes input in pairs and emits per-step sums.

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/chop.const.ts`
- Outcome: Success (exit code `0`). All three examples completed, and the demo finished for `effect/Array.chop`.

## Notes / residual risks
- Runtime inspection preview reflects internal function wrapper formatting and may vary with upstream implementation details.
- Behavior examples are deterministic and aligned to documented `chop` semantics.
