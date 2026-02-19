## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Option/exports/map.const.ts` to replace probe-only behavior with executable, semantics-aligned examples for `Option.map`.
- Kept the runtime inspection example and added two behavior-focused examples:
  - Source-aligned data-first mapping for `Some` and `None`.
  - Reusable data-last mapper used in a pipeline.
- Switched Option import alias to `import * as O from "effect/Option"` and removed the stale `probeNamedExportFunction` helper import.

## Verification command + outcome
- Command:
  - `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Option/exports/map.const.ts`
- Outcome:
  - Passed (exit code `0`).
  - All three examples completed successfully.

## Notes / residual risks
- Examples are deterministic and align with the export summary/JSDoc intent.
- No residual runtime issues were observed in the required verification run.
