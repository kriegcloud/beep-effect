## Changes made
- Updated only `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/filter.const.ts` for the export implementation task.
- Replaced the generic zero-arg callable probe with executable, source-aligned `Array.filter` examples:
  - Data-first invocation: `A.filter([1, 2, 3, 4], n => n % 2 === 0)`.
  - Additional semantics: curried predicate usage and refinement predicate usage.
- Kept the existing runtime program shell and runtime inspection example.
- Removed stale helper usage/import (`probeNamedExportFunction`) and applied the required `effect/Array` alias style (`import * as A from "effect/Array"`).

## Verification command + outcome
- Command:
  - `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/filter.const.ts`
- Outcome:
  - Exit code `0` (success)
  - All examples completed, with logs showing expected filtered outputs: `[2,4]`, `[2,3]`, and `["a","bee"]`.

## Notes / residual risks
- Examples are deterministic and aligned with the source summary/JSDoc intent.
- Residual risk is low and limited to upstream/shared runtime helper behavior changes.
