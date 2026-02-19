## Changes made
- Created `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Cause/exports/isInterruptedOnly.const.ts` and implemented a runnable value-like playground for the assigned export target.
- Preserved the standard playground runtime shell (`createPlaygroundProgram(...)` + `BunRuntime.runMain(program)`) and import contract used by neighboring export examples.
- Added executable behavior-focused examples instead of generic callable probing:
  - Runtime inspection for `isInterruptedOnly` (shows current runtime shape).
  - Legacy export status check (`isInterruptedOnly` missing, `hasInterruptsOnly` present).
  - Source-aligned predicate behavior using `Cause.hasInterruptsOnly` with interrupt/fail/empty/mixed causes.
- Included concise contract notes where runtime behavior differs from the JSDoc expectation for `empty`.

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Cause/exports/isInterruptedOnly.const.ts`
- Outcome: Passed (exit code 0). All three examples completed successfully.

## Notes / residual risks
- `Cause.isInterruptedOnly` is not a current runtime export in `effect/Cause`; the implementation demonstrates compatibility intent via `Cause.hasInterruptsOnly`.
- If upstream reintroduces `isInterruptedOnly` or changes `hasInterruptsOnly` semantics (especially empty-cause handling), example output will need to be updated.
