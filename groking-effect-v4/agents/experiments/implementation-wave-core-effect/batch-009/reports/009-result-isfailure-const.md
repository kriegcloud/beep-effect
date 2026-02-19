## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Result/exports/isFailure.const.ts` only.
- Replaced the generic zero-arg callable probe with executable, source-aligned examples for `Result.isFailure`.
- Kept runtime inspection and added:
  - A JSDoc-aligned narrowing example (`fail("oops")` + `isFailure` + `.failure` access).
  - A mixed-result filtering example using `isFailure` as a predicate.
- Removed stale helper usage by dropping `probeNamedExportFunction` import and adding only needed formatting support.

## Verification command + outcome
- Command:
  - `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Result/exports/isFailure.const.ts`
- Outcome:
  - Exit code `0`.
  - All three examples completed successfully.

## Notes / residual risks
- Examples are deterministic and do not depend on external services or environment state.
- Residual risk is low; this is example/playground code and relies on current `effect/Result` runtime shape (`_tag === "Failure"`) as exposed by the library.
