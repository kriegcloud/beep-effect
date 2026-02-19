## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/getUnsafe.const.ts` to replace generic callable probing with executable, semantically aligned examples.
- Switched the Array import to the required alias style: `import * as A from "effect/Array"`.
- Removed stale `probeNamedExportFunction` usage/import and added `attemptThunk`-based error capture for deterministic throw demonstrations.
- Added two behavior-focused invocation examples beyond runtime inspection:
  - Source-aligned in-range read and out-of-range thrown error.
  - Data-last invocation with non-integer index flooring and bounds failure.

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/getUnsafe.const.ts`
- Outcome: success (exit code `0`).
- Key observed behavior:
  - `A.getUnsafe([1, 2, 3], 1) => 2`
  - `A.getUnsafe([1, 2, 3], 10)` throws `Error: Index out of bounds: 10`
  - `A.getUnsafe(1.9)(["kick", "snare", "hat"]) => snare`
  - `A.getUnsafe(-0.2)(["kick", "snare", "hat"])` throws `Error: Index out of bounds: -1`

## Notes / residual risks
- Examples intentionally execute and catch thrown errors from this unsafe API; behavior depends on the upstream `effect/Array` contract remaining stable.
- No cross-file edits were made beyond the required report artifact.
