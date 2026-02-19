## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/insertAt.const.ts` to replace probe-only behavior with executable `insertAt` examples.
- Removed unused `probeNamedExportFunction` import.
- Switched `effect/Array` import alias to `A` and kept runtime inspection plus semantic invocation examples.
- Added two behavior-focused examples:
  - Source-aligned insertion: `insertAt(["a", "b", "c", "e"], 3, "d")`.
  - Curried iterable + bounds behavior, including out-of-bounds and negative index returning `undefined`.

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/insertAt.const.ts`
- Outcome: Success (exit code `0`). All three examples completed, and logs showed expected insertion and `undefined` for invalid indices.

## Notes / residual risks
- Runtime source header still references `.repos/effect-smol/...`, which is not present in this checkout; examples were validated against the installed `effect/Array` runtime behavior.
