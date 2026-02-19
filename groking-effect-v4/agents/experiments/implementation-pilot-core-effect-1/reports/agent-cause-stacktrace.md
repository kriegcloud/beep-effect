# agent-cause-stacktrace

## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Cause/exports/StackTrace.class.ts`.
- Kept the existing top-level structure and two-example program shell.
- Replaced the constructor probe example with a summary-aligned semantic example that:
  - Annotates a fail cause with deterministic `StackTrace` frame data.
  - Reads annotations from the first reason.
  - Uses `ServiceMap.getOrUndefined` for safe lookup of both present (`StackTrace`) and absent (`InterruptorStackTrace`) keys.
- Added `ServiceMap` import and removed unused constructor-probe helper import.

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Cause/exports/StackTrace.class.ts`
- Outcome: success (exit code `0`).
- Key runtime output:
  - `StackTrace frame: demo-failure-frame`
  - `InterruptorStackTrace present: false`

## Notes / residual risks
- Example currently reads `annotatedCause.reasons[0]`; this matches current public model shape (`Cause` with `reasons`) but still assumes at least one reason for this specific constructed input.
- Stack frame payload is synthetic/deterministic for stability, so it demonstrates key semantics rather than runtime-captured stack fidelity.
