## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Result/exports/getOrThrow.const.ts` to replace the generic zero-arg callable probe with executable, semantics-aligned `Result.getOrThrow` examples.
- Removed stale `probeNamedExportFunction` import/usage and added `attemptThunk` + `formatUnknown` imports used by the new behavior-focused examples.
- Kept the existing top-level program shell and runtime-inspection example, while adding two concrete examples:
  - Source-aligned success unwrap and string-failure throw behavior.
  - Object-failure throw identity behavior (same payload reference thrown).

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Result/exports/getOrThrow.const.ts`
- Outcome: Passed (exit code `0`).
- Observed key outputs:
  - `succeed(1) -> 1`
  - `fail("error") threw -> error`
  - `threw same object reference -> true`

## Notes / residual risks
- Examples align with the current Result contract: success returns the value and failure throws the raw payload without wrapping.
- Residual risk is low and limited to upstream API/runtime changes that could alter display text or internal function preview formatting.
