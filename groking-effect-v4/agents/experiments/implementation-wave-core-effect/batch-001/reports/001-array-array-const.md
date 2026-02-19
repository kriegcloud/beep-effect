## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/Array.const.ts` example blocks to replace generic runtime inspection/probe behavior with executable `Array` constructor semantics.
- Added two behavior-focused examples:
  - `Single-Length Construction`: demonstrates `new Array.Array(3)`, sparse slots, and `fill(0)`.
  - `Value List Construction`: demonstrates variadic constructor arguments and `push` behavior.
- Kept the file’s top-level structure, module metadata, and runtime program shell intact.

## Verification command + outcome
- Command:
  - `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/Array.const.ts`
- Outcome:
  - Exit code `0`.
  - Both examples completed successfully and logged expected constructor behavior.

## Notes / residual risks
- The runtime import contract still includes `inspectNamedExport` and `probeNamedExportFunction`, which are no longer used by examples; this is harmless at runtime but may be flagged by stricter lint configurations if enabled.
