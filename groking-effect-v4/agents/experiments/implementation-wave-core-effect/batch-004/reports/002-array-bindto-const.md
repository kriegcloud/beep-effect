## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/bindTo.const.ts` to replace generic zero-arg probing with executable, source-aligned `bindTo` examples.
- Kept the existing playground shell and top-level layout, while switching the `effect/Array` import alias to `A` and removing the unused `probeNamedExportFunction` helper import.
- Added behavior-focused examples:
  - Source-aligned `bindTo([1, 2, 3], "x")` invocation.
  - `bindTo` as a do-notation seed extended via `A.bind` and `A.let`.

## Verification command + outcome
- Command:
  - `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/bindTo.const.ts`
- Outcome:
  - Exit code `0`.
  - All examples completed successfully and logged expected array-record transformations.

## Notes / residual risks
- Examples are deterministic and aligned with the documented semantics in the file header.
- Residual risk is low; this file demonstrates runtime behavior but does not enforce compile-time type-level constraints.
