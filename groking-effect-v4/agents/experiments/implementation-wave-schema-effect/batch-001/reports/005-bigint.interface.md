## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Schema/exports/BigInt.interface.ts` to replace reflection-only examples with executable `Schema.BigInt` companion API examples.
- Kept the top-level playground structure and runtime shell intact (`createPlaygroundProgram(...)` and `BunRuntime.runMain(program)`).
- Replaced `inspectTypeLikeExport` usage with behavior-focused examples:
  - Runtime bridge/context for the companion export via `inspectNamedExport`.
  - Runtime validation using `Schema.is(Schema.BigInt)` on mixed unknown inputs.
  - Checked decoding using `Schema.BigInt.check(Schema.isBetweenBigInt(...))` with one passing and one failing decode.
- Removed the now-unused `inspectTypeLikeExport` import and added a small sample formatter to keep bigint/string logs unambiguous.

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Schema/exports/BigInt.interface.ts`
- Outcome: Passed (exit code `0`).
- Observed behavior:
  - Runtime preview shows `Schema.BigInt` as a schema value with `ast._tag: "BigInt"`.
  - Type guard returns `true` for bigint inputs and `false` for non-bigint inputs (`12`, `"12"`, `null`).
  - Bounded decode succeeds for `15n` and fails for `25n` with the expected range-check error.

## Notes / residual risks
- `sourceSummary` / `sourceExample` remain unchanged from scaffold values (`No summary found in JSDoc.` / no inline example).
- Error messages for failing decodes come from the Effect Schema runtime and may vary slightly across upstream versions.
