## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/sortBy.const.ts` to replace the generic callable probe with executable `Array.sortBy` scenarios aligned to summary and JSDoc intent.
- Switched `effect/Array` import to alias style (`import * as A from "effect/Array"`) and added `effect/Order` for multi-order examples.
- Removed the unused `probeNamedExportFunction` helper import and added `formatUnknown` for concise behavior-focused logging.
- Added concrete examples for:
  - source-aligned multi-order user sorting (`age` then `name`),
  - tie-breaker sequencing across two orders (`status` then `durationMs`).

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/sortBy.const.ts`
- Outcome: success (exit code `0`). All three examples completed and logged deterministic ordering behavior.

## Notes / residual risks
- Runtime inspection remains intentionally included to satisfy value-like export guidance before behavior demonstrations.
- The runtime preview string for `sortBy` can vary slightly with upstream Effect internals, but behavior examples are deterministic.
