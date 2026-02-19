## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/some.const.ts` to replace the generic callable probe with executable `Array.some` examples aligned to source semantics.
- Switched `effect/Array` import to alias style (`import * as A from "effect/Array"`) and removed the now-unused `probeNamedExportFunction` import.
- Added a source-aligned parity-check example using direct invocation.
- Added a curried (`data-last`) example that demonstrates both short-circuit behavior on first match and full traversal when no match exists.

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/some.const.ts`
- Outcome: Success (exit code 0). All three examples completed, including expected `true/false` parity results and deterministic predicate call counts for short-circuit behavior.

## Notes / residual risks
- Runtime inspection includes module export count and function preview, which are informational and may vary if upstream module internals change.
