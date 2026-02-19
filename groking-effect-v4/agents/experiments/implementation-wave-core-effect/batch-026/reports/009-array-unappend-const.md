## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/unappend.const.ts` to replace probe-only behavior with semantically aligned runnable examples.
- Switched `effect/Array` import to alias style `import * as A from "effect/Array"` and removed the stale `probeNamedExportFunction` helper import.
- Kept runtime inspection, then added two concrete behavior examples:
  - Source-aligned `unappend([1, 2, 3, 4])` invocation with recomposition via `A.append`.
  - Singleton case plus a guard pattern for possibly-empty arrays, with a contract note.

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/unappend.const.ts`
- Outcome: Passed (exit code `0`). All three examples completed successfully under `BunRuntime.runMain`.

## Notes / residual risks
- The playground demonstrates safe guarding for uncertain inputs rather than intentionally invoking `unappend` with invalid (empty) input; runtime failure behavior for contract violations is not exercised in this file.
