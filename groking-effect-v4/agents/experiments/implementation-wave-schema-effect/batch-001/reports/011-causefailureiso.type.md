## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Schema/exports/CauseFailureIso.type.ts` to replace reflection-only type-erasure probes with executable companion-API examples.
- Preserved the existing top-level playground structure and runtime shell (`createPlaygroundProgram(...)` and `BunRuntime.runMain(program)`).
- Removed the stale `inspectTypeLikeExport` import and added `formatUnknown` for concise behavioral logs.
- Added runtime-focused examples:
  - Runtime bridge: confirms type erasure for `CauseFailureIso` and inspects the runtime `Schema.CauseFailure` companion export.
  - Iso round-trip: uses `Schema.CauseFailure(...)` + `Schema.toCodecIso(...)` with `decodeUnknownSync` / `encodeSync` for `Fail` and `Interrupt` payloads.
  - Die branch behavior: demonstrates accepted `Die` payload shape and expected failure for the wrong key.

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Schema/exports/CauseFailureIso.type.ts`
- Outcome: Passed (exit code `0`).
- Observed behavior:
  - `CauseFailureIso` is not present at runtime.
  - Companion runtime API (`Schema.CauseFailure`) is callable and inspectable.
  - Iso codec round-trips `Fail` and `Interrupt` deterministically.
  - `Die` branch accepts `defect` and rejects payloads using `error` (reported as `Missing key`).

## Notes / residual risks
- Source JSDoc has no summary example for this export, so the implementation relies on companion APIs inferred from `Schema.CauseFailure` and `Schema.toCodecIso` behavior.
- The runtime `Die` iso payload key is `defect`; if external type references imply otherwise, that mismatch is upstream and was left unchanged.
