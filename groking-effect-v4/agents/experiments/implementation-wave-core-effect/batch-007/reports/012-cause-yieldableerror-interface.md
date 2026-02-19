## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Cause/exports/YieldableError.interface.ts` to replace reflection-only examples with executable, source-aligned behavior for `Cause.YieldableError`.
- Reworked Example 1 into a bridge flow that explicitly shows interface erasure and inspects the runtime companion constructor `Cause.NoSuchElementError`.
- Replaced the generic module inspection example with a runtime companion API flow that:
  - constructs `new Cause.NoSuchElementError("not found")`,
  - demonstrates `yield* error` failure behavior inside `Effect.gen`,
  - demonstrates `error.asEffect()` failure behavior,
  - confirms `Symbol.iterator` presence and `Cause.isNoSuchElementError` guard behavior,
  - compares that both flows fail with the same error tag.
- Preserved top-level playground structure and runtime shell (`createPlaygroundProgram` + `BunRuntime.runMain(program)`).

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Cause/exports/YieldableError.interface.ts`
- Outcome: Passed (exit code `0`). Both examples completed successfully and logged expected yield/asEffect failure semantics.

## Notes / residual risks
- The runtime companion example relies on current `Effect.flip` semantics around failure inversion; if upstream behavior changes, the example may need minor adaptation while preserving the same teaching intent.
- No runtime failures observed in the required verification run.
