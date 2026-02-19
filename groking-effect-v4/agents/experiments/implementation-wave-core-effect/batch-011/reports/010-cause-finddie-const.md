## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Cause/exports/findDie.const.ts` to replace generic callable probing with executable, source-aligned `findDie` examples.
- Added `Result`-aware examples for:
  - successful extraction from a `Cause.die(...)`
  - annotation retention on returned `Die` reasons
  - failure-channel behavior when no `Die` reason exists
- Removed stale probe helper usage/import and added only needed helpers/imports (`formatUnknown`, `effect/Result`, `effect/ServiceMap`).

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Cause/exports/findDie.const.ts`
- Outcome: Passed (exit code `0`), all examples completed.

## Notes / residual risks
- Annotation demonstration uses a synthetic `ServiceMap` key/value to validate retention mechanics; behavior is deterministic and local.
