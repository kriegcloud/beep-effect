## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/ensure.const.ts` only.
- Replaced the generic zero-arg callable probe with executable, source-aligned `Array.ensure` examples.
- Added behavior examples for:
  - Normalizing a scalar value and an existing array (`ensure("a")`, `ensure(["a", "b", "c"])`).
  - Array pass-through by reference (mutating returned array reflects on original input).
- Removed stale `probeNamedExportFunction` import and switched `effect/Array` import to alias style `import * as A from "effect/Array"`.

## Verification command + outcome
- Command:
  - `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/ensure.const.ts`
- Outcome:
  - Exit code `0`.
  - All three examples completed successfully.

## Notes / residual risks
- Examples are deterministic and aligned with current Effect v4 `ensure` semantics.
- Residual risk is limited to upstream library behavior changes in future Effect releases.
