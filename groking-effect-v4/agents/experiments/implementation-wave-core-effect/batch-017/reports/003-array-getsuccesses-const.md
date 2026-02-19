## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/getSuccesses.const.ts` to replace generic callable probing with executable, source-aligned examples.
- Switched Array import alias to `A` and added `effect/Result` import to construct deterministic `Result` inputs.
- Kept runtime inspection example and added two behavior-focused examples:
  - documented mixed success/failure extraction
  - iterable (`Set`) support plus all-failures empty output case
- Removed stale `probeNamedExportFunction` usage/import.

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/getSuccesses.const.ts`
- Outcome: Passed (exit code `0`).
- Observed behavior:
  - `A.getSuccesses([succeed(1), fail("err"), succeed(2)]) => [1,2]`
  - `A.getSuccesses(Set([...])) => ["first","second"]`
  - `A.getSuccesses(all failures) => []`

## Notes / residual risks
- Examples are deterministic and aligned with the JSDoc contract.
- Residual risk is low; this file depends on upstream `effect/Result` runtime shape remaining stable.
