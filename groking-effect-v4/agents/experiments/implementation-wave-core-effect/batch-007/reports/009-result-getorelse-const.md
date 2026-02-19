## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Result/exports/getOrElse.const.ts` while preserving the existing playground shell (`createPlaygroundProgram(...)` and `BunRuntime.runMain(program)`) and top-level section layout.
- Replaced the generic callable probe with executable, semantically aligned `Result.getOrElse` usage examples:
  - Source-aligned fallback behavior using `Result.succeed(1)` and `Result.fail("err")` with `() => 0`.
  - Curried/data-last behavior using `getOrElse(onFailure)(result)` with an error-aware fallback and explicit `onFailure` call counting.
- Removed stale `probeNamedExportFunction` import/usage and added `formatUnknown` for concise behavior-focused logging.

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Result/exports/getOrElse.const.ts`
- Outcome: Success (exit code `0`).
- Observed result: All three examples completed; logs showed direct success extraction, failure fallback computation, and curried `onFailure` laziness (`0` calls on success path, `1` call on failure path).

## Notes / residual risks
- The curried example uses a structured `{ code, message }` failure payload to demonstrate error-dependent fallback logic; this is illustrative and not a required schema for `getOrElse` failures.
