## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/unionWith.const.ts` to replace generic callable probing with executable, semantics-focused examples.
- Switched `effect/Array` import to alias style (`import * as A from "effect/Array"`) and removed stale `probeNamedExportFunction` usage/import.
- Added source-aligned invocation coverage for `unionWith` in both direct (`unionWith(self, that, eq)`) and curried (`unionWith(that, eq)(self)`) forms.
- Added a custom object-by-id union example to demonstrate deduplication and ordering behavior with custom equivalence.

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/unionWith.const.ts`
- Outcome: Passed (exit code 0). All three examples completed successfully under `BunRuntime.runMain`.

## Notes / residual risks
- The source JSDoc snippet in the file documents the 3-argument form; runtime also supports the curried form, which is demonstrated.
- No additional residual risks identified for this single-file implementation.
