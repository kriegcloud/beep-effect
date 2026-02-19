## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/replicate.const.ts` to replace generic probe-only behavior with executable, source-aligned `Array.replicate` examples.
- Switched `effect/Array` import to the required alias style: `import * as A from "effect/Array"`.
- Removed stale helper usage (`probeNamedExportFunction`) after replacing the callable probe.
- Added behavior-focused examples for:
  - Documented invocation: `A.replicate("a", 3)`.
  - Dual invocation parity: direct vs curried calls.
  - Normalized count behavior (`n` floored and clamped to at least 1).

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/replicate.const.ts`
- Outcome: Passed (exit code `0`). All examples completed successfully and `BunRuntime.runMain` was detected.

## Notes / residual risks
- The normalization behavior demonstrated (`2.7 -> 2`, `0 -> 1`, `-4 -> 1`) reflects current upstream implementation details in `effect/Array` and could change if the library contract changes in a future release.
