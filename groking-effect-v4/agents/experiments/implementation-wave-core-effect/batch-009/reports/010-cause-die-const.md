## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Cause/exports/die.const.ts` only.
- Replaced the generic zero-arg callable probe with executable, semantically aligned examples for `Cause.die`.
- Added a source-aligned constructor example (`Cause.die(new Error("Unexpected"))`) that verifies:
  - `reasons.length === 1`
  - first reason is `Die`
  - `hasDies` is `true`
  - `hasFails` is `false`
  - defect reference identity is preserved
- Added a contract-focused example for `Cause.findDefect` that demonstrates:
  - success path for a `die` cause
  - expected failure path for a typed `fail` cause
- Removed stale helper usage (`probeNamedExportFunction`) and added only needed imports (`formatUnknown`, `ResultModule`).

## Verification command + outcome
- Command:
  - `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Cause/exports/die.const.ts`
- Outcome:
  - Passed (exit code `0`)
  - All three examples completed successfully.

## Notes / residual risks
- The implementation is deterministic and uses stable API contracts (`die`, `isDieReason`, `hasDies`, `hasFails`, `findDefect`).
- No known residual risks beyond upstream behavior changes in the `effect` package.
