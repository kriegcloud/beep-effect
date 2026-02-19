## Changes made
- Replaced the generic callable probe with executable `Option.reduceCompact` behavior examples while preserving the playground shell.
- Updated `effect/Option` import to alias style (`import * as O from "effect/Option"`) and kept runtime inspection via `inspectNamedExport`.
- Added a source-aligned reduction example over `[Some, None, Some, None]` that logs the summed result (`3`).
- Added a curried/data-last example that demonstrates two key semantics:
  - the reducer runs only for `Some` entries (tracked via `reducerCalls`)
  - when all entries are `None`, the seed accumulator is returned unchanged.
- Removed stale helper usage by dropping `probeNamedExportFunction` and adding `formatUnknown` for behavior-focused output logs.

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Option/exports/reduceCompact.const.ts`
- Outcome: Success (exit code `0`). All three examples completed, including:
  - source-aligned sum -> `3`
  - curried reduction max -> `10`
  - reducer call count -> `3` (matching number of `Some` values)
  - all-`None` seed behavior -> `99`.

## Notes / residual risks
- Verification is runtime/log based for this worker task; no assertion-style automated test was added.
- The examples rely on current `effect/Option.reduceCompact` dual-call signature (data-first and data-last), which matched observed runtime behavior.
