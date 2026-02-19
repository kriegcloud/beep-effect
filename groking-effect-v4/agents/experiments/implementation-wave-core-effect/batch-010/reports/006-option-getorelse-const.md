## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Option/exports/getOrElse.const.ts` to replace generic callable probing with executable `Option.getOrElse` behavior examples.
- Kept the runtime playground shell and top-level structure intact.
- Switched the Option import to alias style (`import * as O from "effect/Option"`).
- Removed stale `probeNamedExportFunction` usage/import and added `formatUnknown` for concise value-focused logging.
- Added two semantically aligned behavior examples:
  - JSDoc-aligned `Some`/`None` fallback behavior.
  - Lazy fallback thunk evaluation (fallback runs only on `None`).

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Option/exports/getOrElse.const.ts`
- Outcome: Passed (exit code `0`). All examples completed successfully.

## Notes / residual risks
- The implementation demonstrates documented behavior and lazy fallback evaluation deterministically.
- No additional residual risks identified for this export-level example file.
