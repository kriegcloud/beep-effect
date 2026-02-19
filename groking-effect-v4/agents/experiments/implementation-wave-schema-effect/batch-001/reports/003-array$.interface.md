## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Schema/exports/Array$.interface.ts` to replace reflective-only examples with executable, `Schema.Array(...)` companion API behavior.
- Kept the program shell and top-level structure intact.
- Removed stale `inspectNamedExport` import after replacing the module-context probe.
- Added runtime-focused examples:
  - `Schema.is(Schema.Array(Schema.Number))` for valid vs invalid arrays.
  - `Schema.decodeUnknownSync(Schema.Array(Schema.NonEmptyString))` for success and deterministic failure handling.

## Verification command + outcome
- Command:
  - `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Schema/exports/Array$.interface.ts`
- Outcome:
  - Exit code `0`.
  - All three examples completed successfully.
  - Runtime logs confirmed `Array$` erasure and companion API behavior.

## Notes / residual risks
- `Array$` has no direct runtime value, so behavior is demonstrated via the documented companion constructor `Schema.Array` and parser helpers.
- Logs are intentionally concise and deterministic; no environment-dependent behavior was introduced.
