## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Option/exports/filterMap.const.ts` while preserving the existing top-level playground structure and runtime shell (`createPlaygroundProgram(...)` + `BunRuntime.runMain(program)`).
- Replaced the generic zero-argument callable probe with executable, semantically aligned `Option.filterMap` examples:
  - Source-aligned even-number mapping (`Some(2)`, `Some(3)`, and `None` input paths).
  - Curried/data-last reuse of `filterMap` over string inputs, including `None` short-circuit behavior.
- Removed stale `probeNamedExportFunction` usage/import, added `formatUnknown` for behavior-focused output formatting, and switched Option import alias to `import * as O from "effect/Option"`.

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Option/exports/filterMap.const.ts`
- Outcome: Success (exit code `0`).
- Observed result: All three examples completed; logs showed expected `Some`/`None` behavior for both direct and curried invocations.

## Notes / residual risks
- The curried example uses a simple `/\d$/` suffix rule to keep output deterministic; it demonstrates `filterMap` mechanics rather than broader string-validation semantics.
