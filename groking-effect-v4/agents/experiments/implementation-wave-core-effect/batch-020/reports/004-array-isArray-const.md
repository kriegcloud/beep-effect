## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/isArray.const.ts` to replace the generic zero-arg callable probe with executable `Array.isArray` examples.
- Switched `effect/Array` import alias to `import * as A from "effect/Array"` and removed the unused `probeNamedExportFunction` helper import.
- Added two behavior-focused invocation examples:
  - Source-aligned checks for `null` and `[1, 2, 3]`.
  - Boundary checks contrasting array-like objects, typed arrays, and copied arrays.

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/isArray.const.ts`
- Outcome: Passed (exit code `0`). All three examples completed successfully and logged expected `true`/`false` behavior.

## Notes / residual risks
- Behavior relies on JavaScript's native `Array.isArray` semantics; examples are deterministic and environment-independent for Bun/Node runtimes.
