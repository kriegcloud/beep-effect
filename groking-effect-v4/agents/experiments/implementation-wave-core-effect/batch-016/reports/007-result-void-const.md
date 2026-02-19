## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Result/exports/void.const.ts` to replace generic callable probing with executable `Result.void` behavior examples.
- Kept runtime inspection and added semantic examples that demonstrate:
  - `Result.void` is a pre-built `Success(undefined)` (`isSuccess`, `isFailure`, `merge`, formatted summary).
  - Success-channel continuation behavior (`map`, `andThen`) and that `getOrElse` fallback is not invoked for `Result.void`.
- Removed stale `probeNamedExportFunction` import and added `formatUnknown` for concise runtime logs.

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Result/exports/void.const.ts`
- Outcome: Passed (exit code 0). All three examples completed successfully.

## Notes / residual risks
- Source JSDoc summary/example for `Result.void` is still absent in generated metadata; examples are aligned to observed runtime behavior in this environment.
