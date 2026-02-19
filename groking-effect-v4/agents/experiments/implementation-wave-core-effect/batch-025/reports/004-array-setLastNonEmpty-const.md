## Changes made
- Replaced generic callable probe example with executable, behavior-focused `setLastNonEmpty` examples.
- Switched `effect/Array` import to alias style (`import * as A from "effect/Array"`) and updated `moduleRecord` accordingly.
- Added `formatUnknown` usage for concise, structured output logs.
- Added a source-aligned invocation example (`A.setLastNonEmpty([1, 2, 3], 4)`) and confirmed immutability of the input array.
- Added a curried invocation example plus an explicit contract note showing runtime-permissive behavior on `[] as any` while clarifying the typed non-empty contract.
- Removed stale `probeNamedExportFunction` import and related example wiring.

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/setLastNonEmpty.const.ts`
- Outcome: Passed (exit code 0). All three examples completed successfully.

## Notes / residual risks
- The API contract is non-empty at the type level, but JavaScript runtime accepts empty arrays and returns `[value]`; examples now call this out explicitly to avoid misuse in typed code.
