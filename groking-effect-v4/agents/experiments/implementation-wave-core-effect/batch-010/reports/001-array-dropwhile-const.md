## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/dropWhile.const.ts` to replace the generic zero-arg callable probe with executable `dropWhile` behavior examples.
- Kept the file’s top-level structure and `BunRuntime.runMain(program)` shell intact.
- Switched `effect/Array` import alias to `A` and removed the now-unused `probeNamedExportFunction` import.
- Added two semantic examples:
  - Source-aligned prefix drop (`[1,2,3,4,5]` with `n < 4` -> `[4,5]`).
  - Leading-segment behavior showing drop stops at first predicate failure (`[1,2,4,1,2]` with `n < 3` -> `[4,1,2]`).

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/dropWhile.const.ts`
- Outcome: Passed (exit code `0`), all three examples completed successfully.

## Notes / residual risks
- Examples are deterministic and cover the core runtime behavior, but they do not separately demonstrate the curried/data-last call form.
