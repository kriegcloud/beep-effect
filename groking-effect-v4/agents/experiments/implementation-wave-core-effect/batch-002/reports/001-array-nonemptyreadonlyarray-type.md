## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/NonEmptyReadonlyArray.type.ts` while preserving the top-level program shell and import contract.
- Replaced reflection-only example content with executable, semantically aligned type-like examples:
  - Kept a type-erasure bridge example via `inspectTypeLikeExport`.
  - Added a guarded runtime companion flow using `Array.isReadonlyArrayNonEmpty` plus direct head access (`input[0]`) and `Array.headNonEmpty`.
  - Added a non-mutating readonly companion flow using `Array.append` and `Array.tailNonEmpty`, plus companion runtime context via `inspectNamedExport` on `isReadonlyArrayNonEmpty`.
- Kept logs concise and behavior-focused.

## Verification command + outcome
- Command:
  - `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/NonEmptyReadonlyArray.type.ts`
- Outcome:
  - Exit code `0`.
  - All three examples completed successfully in the playground output.

## Notes / residual risks
- The companion inspection preview labels `isReadonlyArrayNonEmpty` as runtime function `isArrayNonEmpty`; behavior is correct in execution, but naming presentation comes from runtime function metadata.
