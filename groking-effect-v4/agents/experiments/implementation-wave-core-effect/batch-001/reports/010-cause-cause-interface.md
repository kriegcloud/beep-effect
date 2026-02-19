## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Cause/exports/Cause.interface.ts` to replace generic reflection-only examples with executable, `Cause`-aligned companion API flows while preserving imports, top-level structure, and program shell.
- Kept explicit type-erasure coverage for the `Cause` interface (`"Cause" visible at runtime: no`).
- Replaced module-context-only behavior with:
  - `Companion Export Inspection`: inspects runtime `Cause.fail` export.
  - `Source-Aligned Companion Flow`: executes the source pattern (`Cause.fail("Something went wrong")`, `cause.reasons.length`, and `Cause.isFailReason(cause.reasons[0])`) and logs resulting fail errors.

## Verification command + outcome
- Command:
  - `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Cause/exports/Cause.interface.ts`
- Outcome:
  - Exit code `0`.
  - All three examples completed successfully, including the source-aligned companion flow with:
    - `cause.reasons.length: 1`
    - `Cause.isFailReason(cause.reasons[0]): true`
    - `Fail errors: Something went wrong`

## Notes / residual risks
- The companion flow demonstrates a single `Fail` reason path; it does not cover combined causes (`combine`) or non-fail reasons (`die` / `interrupt`) in this file.
