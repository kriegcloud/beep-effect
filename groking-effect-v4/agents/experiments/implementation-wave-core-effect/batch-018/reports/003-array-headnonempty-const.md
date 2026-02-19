## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/headNonEmpty.const.ts` to replace generic callable probing with executable, semantic examples for `A.headNonEmpty`.
- Switched `effect/Array` import alias to `A` per bundle guidance.
- Added `formatUnknown` logging for behavior-focused outputs.
- Kept the runtime inspection example and added two concrete behavior examples:
  - Source-aligned numeric non-empty array invocation.
  - Domain-style non-empty record queue invocation with concise contract note.
- Removed stale `probeNamedExportFunction` usage/import.

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/headNonEmpty.const.ts`
- Outcome: Success (exit code 0). All examples completed.

## Notes / residual risks
- `headNonEmpty` relies on the non-empty array contract at call sites; runtime can still be bypassed with unsafe casts, so correctness depends on preserving the type-level guarantee.
