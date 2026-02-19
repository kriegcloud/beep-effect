## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Schema/exports/Boolean.interface.ts` to replace reflection-only examples with executable, behavior-focused `Schema.Boolean` examples.
- Kept the top-level playground structure and runtime shell intact (`createPlaygroundProgram(...)` and `BunRuntime.runMain(program)`).
- Replaced `inspectTypeLikeExport` usage with three concrete runtime examples:
  - Runtime bridge/context for `Schema.Boolean` using `inspectNamedExport`.
  - Validation with `Schema.is(Schema.Boolean)` over mixed inputs.
  - Decoding with `Schema.decodeUnknownSync(Schema.Boolean)` including an expected failure case.
- Removed the now-unused `inspectTypeLikeExport` import.

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Schema/exports/Boolean.interface.ts`
- Outcome: Passed (exit code `0`).
- Observed behavior:
  - Runtime preview shows `Schema.Boolean` schema AST (`_tag: "Boolean"`).
  - Type guard returns `true` for booleans and `false` for non-booleans.
  - Decode succeeds for booleans and fails for `"true"` with `Expected boolean` error.

## Notes / residual risks
- Source JSDoc for this export does not include a summary or inline runnable example, so examples were aligned to established `effect/Schema` companion APIs (`is`, `decodeUnknownSync`).
- Other interface export files in this batch may still use reflective templates; only the owned file was changed.
