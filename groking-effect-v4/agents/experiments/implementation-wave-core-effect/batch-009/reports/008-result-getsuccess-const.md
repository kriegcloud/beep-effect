## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Result/exports/getSuccess.const.ts` to replace generic probe-only behavior with executable, semantics-aligned `getSuccess` examples.
- Added a source-aligned invocation example for `Result.succeed("ok")` and `Result.fail("err")` and logged concrete `Option` outputs.
- Added a practical success-channel workflow using `Option.match` to branch on extracted success values.
- Removed stale probe helper import/usage and kept runtime inspection plus Bun program shell intact.

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Result/exports/getSuccess.const.ts`
- Outcome: Passed (exit code 0). All three examples completed successfully.

## Notes / residual risks
- The new examples cover documented and representative success/failure paths, but they do not exhaustively exercise all possible `Result` payload/error types.
