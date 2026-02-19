## Changes made
- Edited `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/Do.const.ts` for the requested fix scope.
- Removed unused `probeNamedExportFunction` from the `@beep/groking-effect-v4/runtime/Playground` import list to resolve TS6133 / no-unused-import diagnostics.
- Updated do-notation comprehension calls to use data-first `Array` overloads where callbacks destructure scope values:
  - `bind(self, tag, f)`
  - `filter(self, predicate)`
  - `map(self, f)`
  - `let(self, tag, f)`
- Preserved executable `Array.Do` examples and top-level runtime/program structure, with at least two examples retained (three remain).

## Verification command + outcome
- Command:
  - `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/Do.const.ts`
- Outcome:
  - Exit code `0`.
  - Program ran successfully and completed all examples.

## Notes / residual risks
- Runtime behavior remains aligned with the source `Array.Do` bind/filter/map intent.
- Type diagnostics were mitigated by anchoring generic inference on `self` in data-first calls; broader project-level type/lint status was not modified beyond this owned file.
