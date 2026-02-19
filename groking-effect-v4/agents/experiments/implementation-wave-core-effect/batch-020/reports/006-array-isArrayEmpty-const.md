## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/isArrayEmpty.const.ts` to replace probe-only behavior with executable examples that directly call `A.isArrayEmpty`.
- Switched `effect/Array` import alias to `A` per batch alias style.
- Removed unused `probeNamedExportFunction` import and replaced the callable probe example with:
  - Source-aligned empty/non-empty checks.
  - A guarded processing example showing control flow after emptiness checks.
- Preserved the existing runtime shell (`createPlaygroundProgram` + `BunRuntime.runMain`) and top-level file structure.

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/isArrayEmpty.const.ts`
- Outcome: Passed (exit code `0`). All three examples executed successfully.

## Notes / residual risks
- No functional risks observed from local execution.
- The generated header still references a source path string that may not exist locally, but runtime behavior is verified and unaffected.
