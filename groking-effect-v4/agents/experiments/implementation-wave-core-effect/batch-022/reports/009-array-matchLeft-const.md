## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/matchLeft.const.ts` to replace probe-only behavior with executable, semantic `Array.matchLeft` examples.
- Kept the runtime shell and top-level structure, while removing the stale `probeNamedExportFunction` import/example.
- Switched to the required Array alias style (`import * as A from "effect/Array"`).
- Added two behavior-focused examples:
  - Source-aligned curried usage (`A.matchLeft(options)` then applied to arrays).
  - Data-first overload usage (`A.matchLeft(array, options)`).
- Retained runtime inspection as a lightweight first example and used concise output formatting via `formatUnknown`.

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/matchLeft.const.ts`
- Outcome: Passed (exit code `0`). All three examples completed successfully and logged expected `matchLeft` behavior for empty and non-empty arrays.

## Notes / residual risks
- The examples verify representative runtime behavior for both overload styles, but they are not exhaustive property tests over arbitrary inputs.
