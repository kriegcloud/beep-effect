## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Cause/exports/reasonAnnotations.const.ts`.
- Removed the generic zero-arg callable probe and its stale helper import (`probeNamedExportFunction`).
- Added executable, behavior-focused `Cause.reasonAnnotations` examples:
  - Read a keyed annotation from a single `Fail` reason and show missing-key behavior (`undefined`).
  - Demonstrate per-reason annotation locality by comparing two reasons that share the same key and contrasting with merged `Cause.annotations(...)` behavior.
- Kept runtime export inspection and preserved the file’s top-level program shell.

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Cause/exports/reasonAnnotations.const.ts`
- Outcome: Passed (exit code `0`).
- Observed semantic outputs:
  - `request id: req-42`
  - `missing key is undefined: true`
  - `first reason request id: req-left`
  - `second reason request id: req-right`
  - `merged cause request id: req-right`

## Notes / residual risks
- Runtime inspection metadata (export count/preview rendering) can vary with package/runtime versions.
- The semantic annotation logs are deterministic and align with the documented per-reason `ServiceMap` contract.
