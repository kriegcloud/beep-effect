## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Cause/exports/fromReasons.const.ts`.
- Removed generic runtime inspection/probe helpers and unused `moduleRecord`.
- Added two executable, behavior-focused examples for `Cause.fromReasons`:
  - Source-aligned construction from two fail reasons (`err1`, `err2`) with reason-count and value logging.
  - Mixed reason-kind construction (Fail/Die/Interrupt) with `_tag` ordering and predicate checks (`hasFails`, `hasDies`, `hasInterrupts`).

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Cause/exports/fromReasons.const.ts`
- Outcome: Failed
- Error:
  - `Cannot find module '@effect/platform-bun/BunContext' from '/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/runtime/Playground.ts'`

## Notes / residual risks
- The export file changes are in place and scoped to the owned file.
- Runtime verification is currently blocked by missing environment dependency resolution for `@effect/platform-bun/BunContext`.
