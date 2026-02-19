## Changes made
- Replaced probe-only examples in `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Option/exports/tap.const.ts` with executable, semantics-focused `Option.tap` demos.
- Switched `effect/Option` import to alias style `import * as O from "effect/Option"`.
- Removed stale runtime probe helpers/imports (`inspectNamedExport`, `probeNamedExportFunction`, and `moduleRecord`).
- Added two behavior examples:
  - Source-aligned integer gate (`some(1)`, `some(1.14)`, `none()`).
  - Original-value preservation with a curried tap validator (`requireActiveSession`).

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Option/exports/tap.const.ts`
- Outcome: Passed (exit code `0`). Both examples completed successfully and logged expected `Some`/`None` results.

## Notes / residual risks
- The examples are deterministic and align with the JSDoc contract for `tap`.
- No additional residual risks identified for this file-level change.
