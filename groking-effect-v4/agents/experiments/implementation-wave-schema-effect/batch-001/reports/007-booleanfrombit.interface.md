## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Schema/exports/BooleanFromBit.interface.ts` to replace reflection-only probes with executable `Schema.BooleanFromBit` runtime examples.
- Preserved the existing top-level structure and runtime shell (`createPlaygroundProgram(...)` and `BunRuntime.runMain(program)`).
- Replaced the old examples with behavior-focused examples that exercise companion APIs:
  - Runtime companion bridge via `inspectNamedExport`.
  - Decoding bits with `Schema.decodeUnknownSync(Schema.BooleanFromBit)` (including invalid inputs).
  - Encoding booleans with `Schema.encodeUnknownSync(Schema.BooleanFromBit)` (including a non-boolean failure case).
- Removed the stale `inspectTypeLikeExport` import after replacing reflective-only logic.

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Schema/exports/BooleanFromBit.interface.ts`
- Outcome: Passed (exit code `0`).
- Key runtime results:
  - `decode(0) => false`, `decode(1) => true`
  - `decode(2)` and `decode("1")` fail with `Expected 0 | 1`
  - `encode(true) => 1`, `encode(false) => 0`
  - `encode(1)` fails with `Expected boolean`

## Notes / residual risks
- The source export has no inline JSDoc example; examples were aligned to the documented source implementation semantics (`0/1 <-> boolean`).
- Only the owned implementation file and the required report file were modified.
