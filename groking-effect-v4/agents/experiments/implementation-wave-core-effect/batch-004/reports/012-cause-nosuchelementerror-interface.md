## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Cause/exports/NoSuchElementError.interface.ts` to replace reflection-only module inspection with executable runtime companion behavior.
- Preserved the existing top-level structure, import contract, and runtime shell (`createPlaygroundProgram` + `BunRuntime.runMain`).
- Kept the type-erasure check and added the required bridge context by inspecting the runtime constructor companion export `Cause.NoSuchElementError`.
- Added a source-aligned companion flow that constructs `new Cause.NoSuchElementError("Element not found")` and validates it using `Cause.isNoSuchElementError` for both matching and non-matching inputs.

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Cause/exports/NoSuchElementError.interface.ts`
- Outcome: Passed (exit code `0`).
- Observed behavior:
  - Type-like export erasure is reported while runtime companion constructor visibility is confirmed.
  - Constructor preview is shown as a runtime function/class export.
  - Source-aligned example logs `_tag` and `message`, then logs `true` for `Cause.isNoSuchElementError(error)` and `false` for `Cause.isNoSuchElementError("nope")`.

## Notes / residual risks
- Examples are deterministic and aligned with current `effect/Cause` constructor and guard semantics for `NoSuchElementError`.
- Residual risk: if upstream `effect` changes constructor internals or guard behavior, logged previews/strings may change while intent remains valid.
