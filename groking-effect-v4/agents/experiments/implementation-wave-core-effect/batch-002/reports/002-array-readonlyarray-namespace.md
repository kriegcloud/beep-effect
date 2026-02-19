# 002-array-readonlyarray-namespace

## Changes made
- Edited `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/ReadonlyArray.namespace.ts` only.
- Replaced generic runtime inspection/callable-probe examples with executable, semantically aligned examples:
  - `Type-Only Namespace Erasure`: demonstrates that `Array.ReadonlyArray` is erased at runtime and should be used in type positions.
  - `Runtime APIs Aligned With ReadonlyArray Types`: demonstrates `flatten` plus `isReadonlyArrayNonEmpty`/`headNonEmpty` to mirror the namespace’s type-level non-empty/flatten intent.
- Removed stale helper imports (`inspectNamedExport`, `probeNamedExportFunction`) and switched to `inspectTypeLikeExport`.

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/ReadonlyArray.namespace.ts`
- Outcome: Passed (exit code 0). Both examples completed successfully.

## Notes / residual risks
- `ReadonlyArray` is a declared type namespace in source and is intentionally unavailable at runtime; this file now makes that contract explicit.
- Runtime examples can only demonstrate APIs that correspond to the type-level utilities, not the type aliases themselves.
