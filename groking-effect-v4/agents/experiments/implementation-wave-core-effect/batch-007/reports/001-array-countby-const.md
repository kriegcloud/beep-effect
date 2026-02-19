## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/countBy.const.ts`.
- Replaced generic runtime inspection/callable probe examples with executable, summary-aligned `Array.countBy` invocations.
- Added two deterministic examples: data-first usage from source intent and curried index-aware usage (including empty iterable behavior returning `0`).
- Removed stale helper imports/values (`inspectNamedExport`, `probeNamedExportFunction`, `moduleRecord`) and switched to the required `import * as A from "effect/Array"` alias style.

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/countBy.const.ts`
- Outcome: Passed (exit code `0`).
- Key runtime output:
  - `Array.countBy([1, 2, 3, 4, 5], isEven) => 2`
  - `Array.countBy((n, i) => n >= i)([]) => 0`

## Notes / residual risks
- Examples are deterministic and focus on core counting semantics (predicate matches and index access).
- Residual risk is low; this playground does not exhaustively cover all iterable input shapes beyond arrays.
