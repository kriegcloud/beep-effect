## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Result/exports/fail.const.ts` to replace the generic callable probe with executable, semantics-aligned `Result.fail` examples.
- Preserved the existing top-level structure and runtime shell (`createPlaygroundProgram` + `BunRuntime.runMain`).
- Removed stale `probeNamedExportFunction` import/usage and added `formatUnknown` for concise result formatting.
- Added behavior-focused examples:
  - Source-aligned `Result.fail("Something went wrong")` invocation with `isFailure` / `isSuccess` checks.
  - Failure short-circuit demonstration showing `andThen` mapper skip and `getOrElse` fallback recovery.

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Result/exports/fail.const.ts`
- Outcome: Passed (exit code `0`).
- Observed behavior:
  - Runtime inspection reports `fail` as a function export.
  - Source-aligned example logs `Failure(Something went wrong)`, `isFailure: true`, `isSuccess: false`.
  - Short-circuit example logs `nextStepInvoked: false` and fallback `fallback:network-unreachable`.

## Notes / residual risks
- Examples are deterministic and aligned to the documented `Result.fail` contract.
- Residual risk: If upstream `effect/Result` behavior or pretty-print formatting changes, logged strings may require small updates.
