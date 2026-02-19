## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Cause/exports/findErrorOption.const.ts` to replace the generic zero-arg callable probe with executable, source-aligned examples.
- Kept the existing top-level program shell and runtime inspection example.
- Added `effect/Option` import as `O` and `formatUnknown` utility usage for behavior-focused output.
- Added two semantic examples:
  - `Cause.fail("error")` -> `Option.some` and `Cause.die("defect")` -> `Option.none`.
  - Mixed cause (`die` + `fail`) showing typed error extraction and value identity preservation.
- Removed stale `probeNamedExportFunction` import and corresponding example wiring.

## Verification command + outcome
- Command:
  - `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Cause/exports/findErrorOption.const.ts`
- Outcome:
  - Passed (exit code `0`)
  - All three examples completed successfully.

## Notes / residual risks
- Examples validate documented `Some`/`None` behavior and mixed-cause extraction, but do not exhaustively test traversal order across multiple distinct `Fail` values.
