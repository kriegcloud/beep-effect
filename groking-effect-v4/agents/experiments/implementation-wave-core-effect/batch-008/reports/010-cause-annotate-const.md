## Changes made
- Replaced the generic callable probe example with semantic `Cause.annotate` behavior examples in `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Cause/exports/annotate.const.ts`.
- Added `effect/ServiceMap` usage to run source-aligned invocation and deterministic annotation checks.
- Implemented behavior-focused examples for:
  - JSDoc-style invocation (`Cause.fail` + `ServiceMap.empty`) and observed no-op behavior.
  - Annotating every reason in a multi-reason cause.
  - Default merge vs `{ overwrite: true }` behavior for colliding annotation keys.
- Removed stale `probeNamedExportFunction` import and related probe-only example.

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Cause/exports/annotate.const.ts`
- Outcome: Passed (exit code `0`). All four examples completed successfully.

## Notes / residual risks
- Runtime behavior shows `Cause.annotate(cause, ServiceMap.empty())` returns the original cause instance as a no-op optimization; this is demonstrated explicitly in the examples.
- No additional residual risks identified for this file-level change.
