## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Cause/exports/Interrupt.interface.ts` to replace reflection-only examples with executable, semantics-aligned companion flows.
- Preserved the existing top-level program structure and runtime shell (`createPlaygroundProgram` + `BunRuntime.runMain`).
- Reworked Example 1 into a bridge flow that demonstrates type erasure and inspects runtime companions `Cause.interrupt` and `Cause.isInterruptReason`.
- Reworked Example 2 into a source-aligned runtime flow that constructs interrupt causes, narrows reasons with `Cause.isInterruptReason`, and logs `fiberId` behavior for both explicit and omitted fiber IDs.

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Cause/exports/Interrupt.interface.ts`
- Outcome: Passed (exit code `0`).
- Observed behavior:
  - Type-like export `Interrupt` is reported as erased at runtime.
  - Runtime companions `interrupt` and `isInterruptReason` are inspected as functions.
  - Runtime example logs `fiberId: 123` for `Cause.interrupt(123)` and `fiberId: undefined` for `Cause.interrupt()`.

## Notes / residual risks
- Examples are deterministic and aligned with current `effect/Cause` semantics and JSDoc intent.
- Residual risk: If upstream `effect` changes the internal preview formatting or reason shape, log wording may require small adjustments while the core behavior remains the same.
