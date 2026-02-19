## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Option/exports/zipLeft.const.ts` to replace probe-only behavior with executable `Option.zipLeft` examples.
- Switched Option import to alias style (`import * as O from "effect/Option"`) and aligned `moduleRecord` with the alias.
- Replaced `probeNamedExportFunction` usage with two behavior-focused examples:
  - Source-aligned invocation using `some("hello")` with `some(1)` and `none()`.
  - Left-bias semantics showing left value preservation and left-side `None` short-circuiting.
- Removed stale runtime helper import (`probeNamedExportFunction`) and added `formatUnknown` for concise result logging.

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Option/exports/zipLeft.const.ts`
- Outcome: Exit code `0` (success). All three examples completed, with expected `Some`/`None` results and `BunRuntime.runMain detected: true`.

## Notes / residual risks
- This change validates representative `zipLeft` behavior through runtime examples; it does not add automated assertions in a test suite.
- Output formatting depends on the shared playground runtime helpers, but function semantics are exercised directly via `effect/Option` calls.
