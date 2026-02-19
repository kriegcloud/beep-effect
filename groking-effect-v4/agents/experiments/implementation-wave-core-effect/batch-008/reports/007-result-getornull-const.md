## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Result/exports/getOrNull.const.ts` to replace probe-only behavior with executable, semantics-aligned examples.
- Kept runtime inspection as Example 1, then added:
  - Source-aligned success/failure unwrapping using `Result.getOrNull(Result.succeed(...))` and `Result.getOrNull(Result.fail(...))`.
  - A deterministic nullable-interop example that maps several `Result` values to nullable outputs and filters non-null values.
- Removed stale `probeNamedExportFunction` usage/import and added `formatUnknown` for concise value-focused logging.

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Result/exports/getOrNull.const.ts`
- Outcome: Passed (exit code `0`).
- Runtime output confirmed:
  - `succeed(1) -> 1`
  - `fail("err") -> null`
  - Nullable interop example produced `["alpha", null, "beta"]` and filtered to `["alpha", "beta"]`.

## Notes / residual risks
- The examples are deterministic and aligned with the current `effect/Result` runtime contract (`getOrNull` unary form).
- Residual risk is limited to upstream library behavior changes (e.g., if `Result.getOrNull` semantics change in future versions).
