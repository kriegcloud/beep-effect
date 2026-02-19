## Changes made
- Replaced generic callable probe content in `mapBoth.const.ts` with executable, semantics-focused examples for `Result.mapBoth`.
- Kept runtime inspection, then added a source-aligned example showing both `Success` and `Failure` transformations via `Result.mapBoth({ onSuccess, onFailure })`.
- Added a data-first invocation example (`Result.mapBoth(self, options)`) that logs branch-specific callback execution counts.
- Removed stale probe helper usage/import and introduced `formatUnknown` + a `summarizeResult` helper for concise output.

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Result/exports/mapBoth.const.ts`
- Outcome: Failed in environment setup before example execution.
- Error: `Cannot find module '@effect/platform-bun/BunContext' from '/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/runtime/Playground.ts'`

## Notes / residual risks
- The failure is due to missing runtime dependency resolution in this workspace environment, so end-to-end execution could not be validated here.
- `mapBoth` examples were updated to match upstream documented behavior and dual invocation forms, but runtime output remains unverified until the missing module is available.
