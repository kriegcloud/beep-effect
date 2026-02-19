## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/fromNullishOr.const.ts` to replace the generic callable probe with executable, source-aligned examples.
- Kept runtime inspection and added:
  - Source-aligned conversions for `1`, `null`, and `undefined`.
  - A nullish-boundary example showing `0`, `false`, and `""` remain wrapped while nullish inputs become `[]`.
- Removed stale `probeNamedExportFunction` import and used `formatUnknown` for concise output formatting.
- Switched `effect/Array` import to alias style `import * as A from "effect/Array"`.

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/fromNullishOr.const.ts`
- Outcome: Passed (exit code `0`). All three examples completed successfully.

## Notes / residual risks
- The prompt’s metadata source path (`.repos/effect-smol/...`) is not present locally, so source alignment was based on embedded JSDoc and runtime behavior observed during verification.
