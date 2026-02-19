## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Schema/exports/Bottom.interface.ts` to replace reflection-only examples with executable companion API examples aligned to `Schema.Bottom` semantics.
- Removed stale `inspectNamedExport` usage/import.
- Added three behavior-focused examples:
  - Type erasure bridge plus concrete schema AST inspection (`Schema.String`, `Schema.Array(Schema.Number)`).
  - Shared `Bottom` method flow using `annotate`, `rebuild`, and `decodeUnknownSync` on a `Schema.Struct`.
  - `makeUnsafe` success/failure behavior on `Schema.Number`.

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Schema/exports/Bottom.interface.ts`
- Outcome: Passed (exit code `0`). All three examples completed successfully and the program finished with `Demo complete for effect/Schema.Bottom`.

## Notes / residual risks
- Error text assertions are logged via first-line string output and may change slightly across Effect versions, but success/failure behavior is stable.
