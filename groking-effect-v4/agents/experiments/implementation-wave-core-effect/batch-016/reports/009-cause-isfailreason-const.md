## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Cause/exports/isFailReason.const.ts` to replace the generic zero-arg callable probe with executable, semantically aligned `Cause.isFailReason` examples.
- Kept the runtime inspection example and added two behavior-focused invocation examples:
  - Source-aligned filtering via `Cause.fail("error").reasons.filter(Cause.isFailReason)`.
  - Mixed reason checks showing guard behavior across `Fail`, `Die`, and `Interrupt` reasons.
- Removed stale `probeNamedExportFunction` import after eliminating probe-only usage.

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Cause/exports/isFailReason.const.ts`
- Outcome: Passed (exit code `0`).
- Key runtime lines:
  - `cause.reasons.filter(isFailReason).length => 1`
  - `first fail error => error`
  - `isFailReason(Fail) => true`
  - `isFailReason(Die) => false`
  - `isFailReason(Interrupt) => false`

## Notes / residual risks
- Examples are deterministic and aligned with the module JSDoc contract (predicate over `Reason` values).
- Runtime inspection details (export count / function preview) may vary if upstream `effect` module exports change.
