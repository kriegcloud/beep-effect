## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Option/exports/firstSomeOf.const.ts` to replace the generic zero-arg callable probe with executable, semantics-focused examples.
- Kept the existing playground program shell and top-level structure intact.
- Switched `effect/Option` import alias to `O` and removed the unused `probeNamedExportFunction` import.
- Added a `formatOption` helper for concise behavior-focused logs.
- Added two concrete behavior examples:
  - Source-aligned priority list example (first `Some` + all-`None` fallback).
  - Iterable short-circuit example showing iteration stops after the first `Some`.

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Option/exports/firstSomeOf.const.ts`
- Outcome: Passed (exit code `0`). All three examples completed successfully.

## Notes / residual risks
- Logs intentionally format `Option` outputs as `Some(...)` / `None` for readability rather than raw object dumps.
- No residual runtime errors observed in the required verification run.
