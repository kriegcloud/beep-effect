## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Cause/exports/interruptors.const.ts` to replace generic runtime reflection/probe examples with executable, semantics-focused examples for `Cause.interruptors`.
- Removed stale `inspectNamedExport` / `probeNamedExportFunction` imports and removed the unused `moduleRecord` helper.
- Added three concise examples:
  - Runtime shape (`typeof` + arity contract)
  - Source-aligned invocation (`interrupt(1)` + `interrupt(2)`)
  - Empty-set behavior when no interrupt reasons exist (`fail` + `die`)

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Cause/exports/interruptors.const.ts`
- Outcome: Passed (exit code `0`). All examples completed successfully in Bun runtime.

## Notes / residual risks
- Example formatting stringifies interruptor IDs; for non-primitive/custom fiber identifiers, displayed values rely on each value's `String(...)` representation.
