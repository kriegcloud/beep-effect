## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Cause/exports/findInterrupt.const.ts` to replace the generic zero-arg callable probe with source-aligned `findInterrupt` examples.
- Kept runtime inspection and added executable behavior-focused examples for:
  - success path with `Cause.findInterrupt(Cause.interrupt(42))`
  - annotation preservation on returned interrupt reasons
  - failure contract when no interrupt reason exists (`Filter.fail` carrying original cause)
- Removed stale probe helper import and added only the needed imports (`formatUnknown`, `effect/Result`, `effect/ServiceMap`).

## Verification command + outcome
- Command:
  - `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Cause/exports/findInterrupt.const.ts`
- Outcome:
  - Failed in this environment with:
  - `error: Cannot find module '@effect/platform-bun/BunContext' from '/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/runtime/Playground.ts'`

## Notes / residual risks
- The owned file compiles structurally against existing patterns in sibling `Cause` export files, but runtime verification is currently blocked by missing `@effect/platform-bun` dependency resolution in the local environment.
