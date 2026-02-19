# Batch 021 - 007-array-let-const

## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/let.const.ts` to replace generic probe-only content with executable, behavior-focused `Array.let` examples.
- Switched `effect/Array` import to alias style (`import * as A from "effect/Array"`).
- Removed unused `probeNamedExportFunction` usage/import.
- Added source-aligned summary/example text from `Array.let` JSDoc.
- Added concrete examples for:
  - Do-notation derived field (`A.let` in pipeline).
  - Dimensional difference between `A.let` and `A.bind`.
  - Data-first invocation (`A.let(self, tag, f)`).
- Added `pipe` import from `effect/Function` to correctly compose `Array.Do` pipelines at runtime.

## Verification command + outcome
- Command:
  - `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/let.const.ts`
- Outcome:
  - Exit code `0`.
  - Program executed successfully.
  - All four examples completed without runtime errors.

## Notes / residual risks
- The generated header still references a source path under `.repos/effect-smol/...` that does not exist in this workspace, but runtime behavior and examples are validated against the installed `effect` package.
