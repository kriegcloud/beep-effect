## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/unfold.const.ts` to replace generic runtime reflection/probe examples with executable, semantics-focused `Array.unfold` usage.
- Switched the module import to alias style `import * as A from "effect/Array"` and removed stale helper artifacts (`inspectNamedExport`, `probeNamedExportFunction`, and `moduleRecord`).
- Added two deterministic behavior examples:
  - Source-aligned finite range generation (`A.unfold(1, n => n <= 5 ? [n, n + 1] : undefined)`).
  - Structured tuple-seed unfolding (Fibonacci-pair progression) plus an immediate-stop case returning `[]`.

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/unfold.const.ts`
- Outcome: Passed (exit code `0`). Both examples completed successfully under `BunRuntime.runMain`.

## Notes / residual risks
- The examples intentionally exercise only deterministic success paths; they do not cover performance characteristics for very large unfold sequences.
