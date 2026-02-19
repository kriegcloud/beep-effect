## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/containsWith.const.ts` to replace generic probe-only behavior with executable, semantically aligned `Array.containsWith` examples.
- Preserved the existing playground shell (`createPlaygroundProgram` + `BunRuntime.runMain`) and top-level file structure.
- Removed stale `probeNamedExportFunction` usage/import after replacing zero-arg probing with concrete invocations.
- Switched `effect/Array` import to alias style (`import * as A from "effect/Array"`) and kept runtime inspection plus two behavior-focused examples:
  - Source-aligned curried membership checks for numbers.
  - Two-argument overload usage with custom object equivalence.

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/containsWith.const.ts`
- Outcome: Passed (exit code `0`). All three examples completed successfully and the run ended with `✅ Demo complete for effect/Array.containsWith`.

## Notes / residual risks
- The examples intentionally use deterministic comparators; real-world equivalence functions may have domain-specific edge cases (e.g., deep structural equality) not covered here.
