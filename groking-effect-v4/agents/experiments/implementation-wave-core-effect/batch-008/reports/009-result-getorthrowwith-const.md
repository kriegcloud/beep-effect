## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Result/exports/getOrThrowWith.const.ts` to replace generic callable probing with executable, semantics-aligned examples for `Result.getOrThrowWith`.
- Removed stale `probeNamedExportFunction` import/usage and added only needed shared helpers (`attemptThunk`, `formatUnknown`).
- Kept runtime shape inspection and added two behavior-focused examples:
  - Source-aligned data-first invocation (`getOrThrowWith(result, onFailure)`) showing success return and mapped thrown error.
  - Curried invocation (`getOrThrowWith(onFailure)(result)`) showing mapper is called only on failure.
- Added concise thrown-error formatting so logs clearly show mapped exception type/message.

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Result/exports/getOrThrowWith.const.ts`
- Outcome: Passed (exit code `0`).
- Observed key outputs:
  - `succeed(1) -> 1`
  - `fail("oops") threw Error: Unexpected: oops`
  - `curried succeed("ok") -> ok (mapper calls: 0)`
  - `curried fail({ code: 422, ... }) threw TypeError: E422: invalid payload (mapper calls: 1)`

## Notes / residual risks
- Examples are deterministic and aligned with the source JSDoc intent plus the documented dual-arity contract.
- Residual risk is low within this file; if upstream `Result.getOrThrowWith` overload behavior changes, logs may need refresh to reflect new contract details.
