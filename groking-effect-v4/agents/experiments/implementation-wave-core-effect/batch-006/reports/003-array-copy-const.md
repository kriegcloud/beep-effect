## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/copy.const.ts` to replace probe-only behavior with executable, source-aligned examples.
- Kept the runtime inspection example and removed `probeNamedExportFunction` usage/import.
- Switched `effect/Array` import to alias style (`import * as A from "effect/Array"`) and updated `moduleRecord` accordingly.
- Added two semantic examples:
  - Source-aligned `A.copy([1, 2, 3])` showing copied contents and different top-level reference.
  - Shallow-copy behavior showing independent top-level array length changes and shared nested object references.

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/copy.const.ts`
- Outcome: Passed (exit code 0). All three examples completed successfully.

## Notes / residual risks
- The shallow-copy example intentionally mutates nested data to demonstrate shared object references; this is expected for shallow copy semantics.
- Runtime inspection remains informational and depends on module export metadata shape, but behavioral examples are deterministic.
