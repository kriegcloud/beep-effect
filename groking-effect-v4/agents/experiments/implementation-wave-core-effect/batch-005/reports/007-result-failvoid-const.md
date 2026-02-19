## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Result/exports/failVoid.const.ts` to replace generic callable probing with executable, semantics-focused examples for `Result.failVoid`.
- Kept top-level program shell and export metadata intact.
- Removed unused `probeNamedExportFunction` import and added `formatUnknown` for concise channel-value logging.
- Added two behavior examples beyond runtime inspection:
  - Pre-built failure semantics (`isFailure`, `isSuccess`, `merge`).
  - Short-circuit behavior with `andThen` plus recovery using `getOrElse`.

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Result/exports/failVoid.const.ts`
- Outcome: Passed (exit code 0). All three examples completed successfully.

## Notes / residual risks
- Runtime preview omits the `failure: undefined` property due to JSON serialization behavior; this is explicitly covered by the behavior example logs (`Failure(undefined)` and `merged value: undefined`).
