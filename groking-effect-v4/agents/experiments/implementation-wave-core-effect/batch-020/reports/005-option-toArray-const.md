## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Option/exports/toArray.const.ts` to replace generic runtime inspection/probe examples with executable `Option.toArray` behavior examples.
- Removed stale helper usage/imports tied to reflection/probing (`inspectNamedExport`, `probeNamedExportFunction`) and switched `effect/Option` import to alias `O`.
- Added two semantically aligned examples:
  - Source-aligned `Some` vs `None` conversion (`[1]` vs `[]`).
  - Practical `flatMap(toArray)` workflow to filter out missing optional values.

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Option/exports/toArray.const.ts`
- Outcome: Passed (exit code `0`). Both examples completed successfully and produced expected output.

## Notes / residual risks
- Examples are deterministic and align with the documented contract for `Option.toArray`.
- Residual risk is low; no additional edge-case behavior beyond `Some`/`None` conversion and array-flattening interop is covered in this file.
