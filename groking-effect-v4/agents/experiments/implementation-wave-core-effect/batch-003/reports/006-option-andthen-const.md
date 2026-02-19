## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Option/exports/andThen.const.ts` to replace generic callable probing with executable, source-aligned `Option.andThen` behavior examples.
- Kept the runtime shell and top-level section structure intact (`createPlaygroundProgram(...)` + `BunRuntime.runMain(program)`).
- Removed stale `probeNamedExportFunction` usage/import and switched Option import alias to `import * as O from "effect/Option"`.
- Added behavior-focused examples covering:
  - function continuation returning `Option`
  - function continuation returning plain value (auto-wrapped to `Some`)
  - static plain value and static `Option` inputs
  - `None` short-circuit behavior

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Option/exports/andThen.const.ts`
- Outcome: Success (exit code `0`).
- Observed runtime output confirmed all 3 examples completed and logged expected `Some(...)` / `None` results.

## Notes / residual risks
- `summarizeOption` uses `JSON.stringify` for `Some` payload display; complex/non-JSON values would stringify less richly, but current examples are deterministic primitives and remain clear.
