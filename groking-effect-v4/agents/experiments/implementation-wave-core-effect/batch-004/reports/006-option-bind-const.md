## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Option/exports/bind.const.ts` to replace generic reflection/probe-only behavior with executable, semantics-aligned `Option.bind` examples.
- Kept the existing top-level program structure and runtime shell (`createPlaygroundProgram` + `BunRuntime.runMain`).
- Removed stale `probeNamedExportFunction` usage/import.
- Switched `effect/Option` import to alias style `import * as O from "effect/Option"` and updated references.
- Added two behavior-focused invocation examples:
  - Building a record through `Option.Do` + chained `Option.bind` + `Option.let`.
  - Demonstrating short-circuiting when a `bind` step returns `None`.

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Option/exports/bind.const.ts`
- Outcome: Passed (exit code `0`).
- Observed behavior:
  - Runtime inspection reports `bind` as a function export.
  - Happy-path example logs `Some({"x":2,"y":3,"sum":5})`.
  - Short-circuit example logs `isNone: true` with fallback `{"reason":"missing y"}`.

## Notes / residual risks
- Examples are deterministic and source-aligned for current `effect/Option.bind` semantics.
- Residual risk: If upstream `effect` changes `bind` do-notation behavior or output formatting, log strings may need updates even though core intent remains valid.
